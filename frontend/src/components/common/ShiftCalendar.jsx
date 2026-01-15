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

  const eventStyleGetter = (event) => {
    let backgroundColor = '#e9ecef'
    let borderColor = '#ddd'
    let color = '#333'

    if (type === 'volunteer') {
      if (event.resource.isUserSignedUp) {
        // User is signed up for this shift - highlight in green
        backgroundColor = '#d4edda'
        borderColor = '#28a745'
        color = '#155724'
      } else if (event.resource.isFull) {
        // Shift is full but user isn't signed up - gray out
        backgroundColor = '#e9ecef'
        borderColor = '#ddd'
        color = '#999'
      } else if (event.resource.isUnderstaffed) {
        // Shift is understaffed - yellow
        backgroundColor = '#fff3cd'
        borderColor = '#ffc107'
        color = '#856404'
      } else if (event.resource.isAvailable) {
        // Shift is available - blue
        backgroundColor = '#d1ecf1'
        borderColor = '#17a2b8'
        color = '#0c5460'
      }
    } else if (type === 'coordinator') {
      if (event.resource.isFull) {
        backgroundColor = '#d4edda'
        borderColor = '#28a745'
        color = '#155724'
      } else if (event.resource.isUnderstaffed) {
        backgroundColor = '#fff3cd'
        borderColor = '#ffc107'
        color = '#856404'
      } else {
        backgroundColor = '#e9ecef'
        borderColor = '#ddd'
        color = '#666'
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color,
        border: `2px solid ${borderColor}`,
        display: 'block',
        padding: '4px 6px',
        fontSize: '12px',
      }
    }
  }

  return (
    <div style={{ height: '600px', marginBottom: '20px' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        eventPropGetter={eventStyleGetter}
        onSelectEvent={(event) => setSelectedEvent(event)}
        popup
        selectable
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
