import { useState, useMemo } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth } from 'date-fns'

export default function ShiftCalendar({ shifts, signups, type = 'volunteer' }) {
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get calendar days
  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const calendarStart = startOfWeek(monthStart)
  const calendarEnd = endOfWeek(monthEnd)
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd })

  // Create event data
  const events = useMemo(() => {
    return shifts.map(shift => {
      let signupCount = 0
      let isUserSignedUp = false

      if (type === 'volunteer') {
        signupCount = signups.filter(s => {
          if (s.shift && s.shift.id === shift.id) {
            isUserSignedUp = true
            return true
          }
          return false
        }).length
      } else {
        signupCount = signups.filter(s => s.shift_id === shift.id || (s.shift && s.shift.id === shift.id)).length
      }

      const isFull = signupCount >= shift.capacity
      const isUnderstaffed = signupCount < shift.capacity && signupCount > 0

      return {
        id: shift.id,
        date: new Date(shift.date),
        shift_type: shift.shift_type,
        capacity: shift.capacity,
        currentSignups: signupCount,
        isFull,
        isUnderstaffed,
        isAvailable: signupCount === 0,
        isUserSignedUp,
      }
    })
  }, [shifts, signups, type])

  // Group events by date
  const eventsByDate = useMemo(() => {
    const grouped = {}
    events.forEach(event => {
      const dateKey = format(event.date, 'yyyy-MM-dd')
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      grouped[dateKey].push(event)
    })
    return grouped
  }, [events])

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Calendar Navigation */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <button
          onClick={handlePrevMonth}
          style={{
            backgroundColor: '#e9ecef',
            color: '#333',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          ← Previous
        </button>
        <h2 style={{ margin: 0, minWidth: '200px', textAlign: 'center' }}>
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button
          onClick={handleNextMonth}
          style={{
            backgroundColor: '#e9ecef',
            color: '#333',
            padding: '8px 16px',
            borderRadius: '4px',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      <div style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: 'white',
        marginBottom: '20px'
      }}>
        {/* Week Day Headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', backgroundColor: '#f8f9fa', borderBottom: '2px solid #ddd' }}>
          {weekDays.map(day => (
            <div
              key={day}
              style={{
                padding: '12px',
                fontWeight: 'bold',
                textAlign: 'center',
                fontSize: '13px',
                color: '#333',
                borderRight: '1px solid #ddd'
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' }}>
          {calendarDays.map((day, idx) => {
            const dateKey = format(day, 'yyyy-MM-dd')
            const dayEvents = eventsByDate[dateKey] || []
            const isCurrentMonth = isSameMonth(day, currentDate)
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')

            return (
              <div
                key={idx}
                style={{
                  borderRight: idx % 7 !== 6 ? '1px solid #ddd' : 'none',
                  borderBottom: '1px solid #ddd',
                  minHeight: '150px',
                  padding: '8px',
                  backgroundColor: isToday ? '#f0f8ff' : !isCurrentMonth ? '#fafafa' : 'white',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                {/* Day Number */}
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    marginBottom: '8px',
                    color: isCurrentMonth ? '#333' : '#ccc'
                  }}
                >
                  {format(day, 'd')}
                </div>

                {/* Events */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'auto' }}>
                  {dayEvents.map(event => {
                    let bgColor = '#e9ecef'
                    let textColor = '#666'
                    let borderColor = '#ddd'
                    let statusText = 'Available'

                    if (type === 'volunteer') {
                      if (event.isUserSignedUp) {
                        bgColor = '#d4edda'
                        textColor = '#155724'
                        borderColor = '#28a745'
                        statusText = '✓ Signed'
                      } else if (event.isFull) {
                        bgColor = '#e9ecef'
                        textColor = '#999'
                        borderColor = '#ddd'
                        statusText = 'Full'
                      } else if (event.isUnderstaffed) {
                        bgColor = '#fff3cd'
                        textColor = '#856404'
                        borderColor = '#ffc107'
                        statusText = '⚠ Help'
                      } else {
                        bgColor = '#d1ecf1'
                        textColor = '#0c5460'
                        borderColor = '#17a2b8'
                        statusText = 'Open'
                      }
                    } else {
                      if (event.isFull) {
                        bgColor = '#d4edda'
                        textColor = '#155724'
                        borderColor = '#28a745'
                        statusText = '✓ Full'
                      } else if (event.isUnderstaffed) {
                        bgColor = '#fff3cd'
                        textColor = '#856404'
                        borderColor = '#ffc107'
                        statusText = '⚠ Short'
                      } else {
                        bgColor = '#e9ecef'
                        textColor = '#666'
                        borderColor = '#ddd'
                        statusText = 'Open'
                      }
                    }

                    return (
                      <div
                        key={event.id}
                        onClick={() => setSelectedEvent(event)}
                        style={{
                          backgroundColor: bgColor,
                          border: `2px solid ${borderColor}`,
                          borderRadius: '4px',
                          padding: '6px',
                          cursor: 'pointer',
                          fontSize: '11px',
                          color: textColor,
                          fontWeight: '600',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)'
                          e.currentTarget.style.transform = 'scale(1.02)'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = 'none'
                          e.currentTarget.style.transform = 'scale(1)'
                        }}
                      >
                        <div style={{ marginBottom: '2px' }}>{event.shift_type}</div>
                        <div style={{ fontSize: '10px', marginBottom: '2px' }}>
                          {event.currentSignups}/{event.capacity}
                        </div>
                        <div style={{ fontSize: '9px' }}>{statusText}</div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Details */}
      {selectedEvent && (
        <div style={{
          padding: '20px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px',
          border: '2px solid #ddd'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ marginTop: 0, marginBottom: '10px', color: '#333' }}>
                {selectedEvent.shift_type}
              </h3>
              <p style={{ color: '#666', marginBottom: '15px', fontSize: '14px' }}>
                {format(selectedEvent.date, 'EEEE, MMMM d, yyyy')}
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
                    {selectedEvent.capacity}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>Signups</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>
                    {selectedEvent.currentSignups}
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px', fontWeight: '600' }}>Available</div>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ffc107' }}>
                    {selectedEvent.capacity - selectedEvent.currentSignups}
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
                  backgroundColor: selectedEvent.isFull ? '#28a745' : selectedEvent.isUnderstaffed ? '#ffc107' : '#e9ecef',
                  color: selectedEvent.isFull ? 'white' : selectedEvent.isUnderstaffed ? '#000' : '#666'
                }}>
                  {selectedEvent.isFull ? '✓ Full' : selectedEvent.isUnderstaffed ? '⚠ Understaffed' : 'Open'}
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
                marginLeft: '20px'
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
