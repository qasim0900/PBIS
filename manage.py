import os
import sys
import logging

def main():

    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PBIS.settings')
    except Exception as e:
        logging.error(
            f"DJANGO_SETTINGS_MODULE setup failed: {e} - Set default settings module for Django")
        sys.exit(1)

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        logging.error(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        )
        raise ImportError from exc
    except Exception as e:
        logging.error(
            f"Unexpected error importing execute_from_command_line: {e}")
        sys.exit(1)

    try:
        execute_from_command_line(sys.argv)
    except Exception as e:
        logging.error(f"Execution failed: {e}")
        sys.exit(1)

if __name__ == '__main__':
    main()
