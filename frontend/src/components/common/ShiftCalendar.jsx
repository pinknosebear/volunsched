import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import enUS from 'date-fns/locale/en-US'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

// Custom day cell component for better visualization
function DayCell({ dayShifts, type }) {
  if (dayShifts.length === 0) {
    return null
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {dayShifts.map((shift, idx) => {
        const signupCount = shift.resource.currentSignups
        const capacity = shift.resource.capacity
        const isFull = shift.resource.isFull
        const isUnderstaffed = shift.resource.isUnderstaffed
        const isUserSignedUp = shift.resource.isUserSignedUp

        // Determine background color
        let bgColor = '#e9ecef'
        let textColor = '#666'
        let borderColor = '#ddd'

        if (type === 'volunteer') {
          if (isUserSignedUp) {
            bgColor = '#d4edda'
            textColor = '#155724'
            borderColor = '#28a745'
          } else if (isFull) {
            bgColor = '#e9ecef'
            textColor = '#999'
            borderColor = '#ddd'
          } else if (isUnderstaffed) {
            bgColor = '#fff3cd'
            textColor = '#856404'
            borderColor = '#ffc107'
          } else {
            bgColor = '#d1ecf1'
            textColor = '#0c5460'
            borderColor = '#17a2b8'
          }
        } else {
          // coordinator view
          if (isFull) {
            bgColor = '#d4edda'
            textColor = '#155724'
            borderColor = '#28a745'
          } else if (isUnderstaffed) {
            bgColor = '#fff3cd'
            textColor = '#856404'
            borderColor = '#ffc107'
          } else {
            bgColor = '#e9ecef'
            textColor = '#666'
            borderColor = '#ddd'
          }
        }

        return (
          <div
            key={idx}
            style={{
              backgroundColor: bgColor,
              border: `2px solid ${borderColor}`,
              borderRadius: '4px',
              padding: '6px 8px',
              fontSize: '11px',
              color: textColor,
              fontWeight: 'bold',
            }}
          >
            <div style={{ marginBottom: '3px' }}>{shift.resource.shift_type}</div>
            <div style={{ fontSize: '10px', fontWeight: 'normal' }}>
              {signupCount}/{capacity} signed up
            </div>
            <div style={{
              fontSize: '9px',
              marginTop: '2px',
              fontWeight: 'normal',
              opacity: 0.8
            }}>
              {isFull ? '✓ Full' : isUnderstaffed ? '⚠ Understaffed' : 'Available'}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function ShiftCalendar({ shifts, signups, type = 'volunteer' }) {
  const [selectedEvent, setSelectedEvent] = useState(null)

  const events = useMemo(() => {
    return shifts.map(shift => {
      let signupCount = 0
      let isUserSignedUp = false

      if (type === 'volunteer') {
        // For volunteer view: signups is an array of user's own signups with nested shift object
        signupCount = signups.filter(s => {
          if (s.shift && s.shift.id === shift.id) {
            isUserSignedUp = true
            return true
          }
          return false
        }).length
      } else {
        // For coordinator view: signups is an array of all signups with shift_id field
        signupCount = signups.filter(s => s.shift_id === shift.id || (s.shift && s.shift.id === shift.id)).length
      }

      const isFull = signupCount >= shift.capacity
      const isUnderstaffed = signupCount < shift.capacity && signupCount > 0

      return {
        id: shift.id,
        title: `${shift.shift_type}`,
        start: new Date(shift.date),
        end: new Date(shift.date),
        resource: {
          ...shift,
          currentSignups: signupCount,
          isFull,
          isUnderstaffed,
          isAvailable: signupCount === 0,
          isUserSignedUp,
        }
      }
    })
  }, [shifts, signups, type])

  // Group events by day for custom rendering
  const eventsByDate = useMemo(() => {
    const grouped = {}
    events.forEach(event => {
      const dateKey = event.start.toISOString().split('T')[0]
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])

  const CustomDateCellWrapper = (props) => {
    const dateKey = props.value.toISOString().split('T')[0]
    const dayShifts = eventsByDate[dateKey] || []

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
          {props.value.getDate()}
        </div>
        <div style={{ flex: 1, overflow: 'auto', fontSize: '11px' }}>
          <DayCell dayShifts={dayShifts} type={type} />
        </div>
      </div>
    )
  }

  return (
    <div style={{ height: '700px', marginBottom: '20px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        view="month"
        defaultView="month"
        onSelectEvent={(event) => setSelectedEvent(event)}
        components={{
          dateCellWrapper: CustomDateCellWrapper,
        }}
        popup
      />

      {selectedEvent && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div>
              <h3 style={{ marginTop: 0 }}>{selectedEvent.resource.shift_type}</h3>
              <p style={{ color: '#666', marginBottom: '10px' }}>
                {selectedEvent.start.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '15px',
                marginTop: '10px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Capacity</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedEvent.resource.capacity}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Current Signups</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{selectedEvent.resource.currentSignups}</div>
                </div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>Status</div>
                <span style={{
                  display: 'inline-block',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  backgroundColor: selectedEvent.resource.isFull ? '#28a745' : selectedEvent.resource.isUnderstaffed ? '#ffc107' : '#e9ecef',
                  color: selectedEvent.resource.isFull ? 'white' : selectedEvent.resource.isUnderstaffed ? '#000' : '#666'
                }}>
                  {selectedEvent.resource.isFull ? 'Full' : selectedEvent.resource.isUnderstaffed ? 'Understaffed' : 'Open'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 12px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
