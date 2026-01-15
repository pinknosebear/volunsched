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
        title: `${shift.shift_type} (${signupCount}/${shift.capacity})`,
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
      <div style={{ height: '100%', padding: '8px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '8px', color: '#333' }}>
          {props.value.getDate()}
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {dayShifts.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {dayShifts.map((shift) => {
                const signupCount = shift.resource.currentSignups
                const capacity = shift.resource.capacity
                const isFull = shift.resource.isFull
                const isUnderstaffed = shift.resource.isUnderstaffed
                const isUserSignedUp = shift.resource.isUserSignedUp

                // Determine background color based on status
                let bgColor = '#e9ecef'
                let textColor = '#666'
                let borderColor = '#ddd'
                let statusText = 'Available'

                if (type === 'volunteer') {
                  if (isUserSignedUp) {
                    bgColor = '#d4edda'
                    textColor = '#155724'
                    borderColor = '#28a745'
                    statusText = '✓ Signed Up'
                  } else if (isFull) {
                    bgColor = '#e9ecef'
                    textColor = '#999'
                    borderColor = '#ddd'
                    statusText = 'Full'
                  } else if (isUnderstaffed) {
                    bgColor = '#fff3cd'
                    textColor = '#856404'
                    borderColor = '#ffc107'
                    statusText = '⚠ Need Help'
                  } else {
                    bgColor = '#d1ecf1'
                    textColor = '#0c5460'
                    borderColor = '#17a2b8'
                    statusText = 'Open'
                  }
                } else {
                  // Coordinator view
                  if (isFull) {
                    bgColor = '#d4edda'
                    textColor = '#155724'
                    borderColor = '#28a745'
                    statusText = '✓ Full'
                  } else if (isUnderstaffed) {
                    bgColor = '#fff3cd'
                    textColor = '#856404'
                    borderColor = '#ffc107'
                    statusText = '⚠ Understaffed'
                  } else {
                    bgColor = '#e9ecef'
                    textColor = '#666'
                    borderColor = '#ddd'
                    statusText = 'Open'
                  }
                }

                return (
                  <div
                    key={shift.id}
                    onClick={() => setSelectedEvent(shift)}
                    style={{
                      backgroundColor: bgColor,
                      border: `2px solid ${borderColor}`,
                      borderRadius: '4px',
                      padding: '6px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'
                      e.currentTarget.style.transform = 'translateY(-1px)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none'
                      e.currentTarget.style.transform = 'translateY(0)'
                    }}
                  >
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: textColor, marginBottom: '2px' }}>
                      {shift.resource.shift_type}
                    </div>
                    <div style={{ fontSize: '10px', color: textColor, marginBottom: '2px' }}>
                      {signupCount}/{capacity}
                    </div>
                    <div style={{ fontSize: '9px', color: textColor, fontWeight: '600' }}>
                      {statusText}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : null}
        </div>
      </div>
    )
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ height: '700px', marginBottom: '20px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view="month"
          defaultView="month"
          components={{
            dateCellWrapper: CustomDateCellWrapper,
          }}
          popup={false}
        />
      </div>

      {selectedEvent && (
        <div style={{
          marginTop: '20px',
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px solid #ddd'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>
                {selectedEvent.resource.shift_type}
              </h3>
              <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
                {selectedEvent.start.toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric'
                })}
              </p>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '15px',
                marginBottom: '15px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>Capacity</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#007bff' }}>
                    {selectedEvent.resource.capacity}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>Current Signups</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                    {selectedEvent.resource.currentSignups}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>Remaining</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                    {selectedEvent.resource.capacity - selectedEvent.resource.currentSignups}
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: '600' }}>Status</div>
                <span style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  backgroundColor: selectedEvent.resource.isFull ? '#28a745' : selectedEvent.resource.isUnderstaffed ? '#ffc107' : '#e9ecef',
                  color: selectedEvent.resource.isFull ? 'white' : selectedEvent.resource.isUnderstaffed ? '#000' : '#666'
                }}>
                  {selectedEvent.resource.isFull ? '✓ Full' : selectedEvent.resource.isUnderstaffed ? '⚠ Understaffed' : 'Open'}
                </span>
              </div>
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              style={{
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px',
                marginLeft: '20px',
                minWidth: '80px'
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
