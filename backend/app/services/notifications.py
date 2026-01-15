"""Notification service for WhatsApp/SMS communications"""
import os
from app.models import Volunteer, Shift


class NotificationService:
    """Service for sending notifications via Twilio WhatsApp/SMS"""

    @staticmethod
    def send_confirmation(volunteer_id, shift_id):
        """
        Send signup confirmation to volunteer via WhatsApp

        Args:
            volunteer_id: ID of the volunteer
            shift_id: ID of the shift
        """
        volunteer = Volunteer.query.get(volunteer_id)
        shift = Shift.query.get(shift_id)

        if not volunteer or not shift:
            return False

        message = f"✓ Confirmed! You're signed up for {shift.shift_type} shift on {shift.date.strftime('%A, %B %d')}."

        return NotificationService._send_whatsapp(volunteer.phone, message)

    @staticmethod
    def send_reminder(volunteer_id, shift_id):
        """
        Send shift reminder to volunteer via WhatsApp

        Args:
            volunteer_id: ID of the volunteer
            shift_id: ID of the shift
        """
        volunteer = Volunteer.query.get(volunteer_id)
        shift = Shift.query.get(shift_id)

        if not volunteer or not shift:
            return False

        message = f"📢 Reminder: You have a {shift.shift_type} shift tomorrow ({shift.date.strftime('%B %d')}). See you there!"

        return NotificationService._send_whatsapp(volunteer.phone, message)

    @staticmethod
    def send_cancellation(volunteer_id, shift_id):
        """
        Send cancellation notification to volunteer

        Args:
            volunteer_id: ID of the volunteer
            shift_id: ID of the shift
        """
        volunteer = Volunteer.query.get(volunteer_id)
        shift = Shift.query.get(shift_id)

        if not volunteer or not shift:
            return False

        message = f"❌ Your signup for {shift.shift_type} shift on {shift.date.strftime('%A, %B %d')} has been cancelled."

        return NotificationService._send_whatsapp(volunteer.phone, message)

    @staticmethod
    def send_custom_message(phone_number, message):
        """
        Send custom message to a phone number

        Args:
            phone_number: Phone number to send to
            message: Message content

        Returns:
            bool: True if successful, False otherwise
        """
        return NotificationService._send_whatsapp(phone_number, message)

    @staticmethod
    def _send_whatsapp(phone_number, message):
        """
        Internal method to send WhatsApp message via Twilio

        Args:
            phone_number: Recipient phone number
            message: Message content

        Returns:
            bool: True if successful, False otherwise
        """
        # Check if Twilio credentials are configured
        account_sid = os.getenv('TWILIO_ACCOUNT_SID')
        auth_token = os.getenv('TWILIO_AUTH_TOKEN')
        whatsapp_number = os.getenv('TWILIO_WHATSAPP_NUMBER')

        if not all([account_sid, auth_token, whatsapp_number]):
            # In development, just log the message
            print(f"[NOTIFICATION] To {phone_number}: {message}")
            return True

        try:
            from twilio.rest import Client

            client = Client(account_sid, auth_token)

            client.messages.create(
                from_=whatsapp_number,
                body=message,
                to=f'whatsapp:{phone_number}'
            )
            return True
        except Exception as e:
            print(f"Error sending WhatsApp message: {str(e)}")
            return False
