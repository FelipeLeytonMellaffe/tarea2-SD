import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import logging

SMTP_SERVER = 'smtp.gmail.com'
SMTP_PORT = 587
SMTP_USER = 'tareasd2@gmail.com'
SMTP_PASSWORD = 'duhp wkwm yucc isou'

def send_email(to_email, subject, body):
    try:
        # Crea el mensaje usando MIMEMultipart
        msg = MIMEMultipart()
        msg['From'] = SMTP_USER
        msg['To'] = to_email
        msg['Subject'] = subject

        # Asegúrate de adjuntar el cuerpo del mensaje con codificación UTF-8
        msg.attach(MIMEText(body, 'plain', 'utf-8'))

        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.starttls()  # Inicia la conexión segura
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.sendmail(SMTP_USER, to_email, msg.as_string())
            print(f"Email sent to {to_email}")
    except UnicodeEncodeError as ue:
        logging.error(f"UnicodeEncodeError: {ue}")
        print("Failed to send email due to character encoding issue. Please check the email content.")
    except Exception as e:
        logging.error(f"Failed to send email: {e}")
        print(f"Failed to send email: {e}")

# Ejemplo de uso
if __name__ == "__main__":
    test_email = 'tareasd2@gmail.com'  # Cambia esto por una dirección de correo válida
    test_subject = 'Test Email'
    test_body = 'Este es un correo de prueba con caracteres especiales: á, é, í, ó, ú.'
    send_email(test_email, test_subject, test_body)
