#!/usr/bin/env python
import os
import sys
import logging


# -----------------------------------
# :: MAIN FUNCTION
# -----------------------------------

"""
Django's command-line utility for administrative tasks.
"""


def main():

    # -----------------------------------
    # :: DJANGO_SETTINGS_MODULE
    # -----------------------------------
    """
    Set the default Django settings module
    """

    try:
        os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'PBIS.settings')
    except Exception as e:
        logging.error(
            f"DJANGO_SETTINGS_MODULE setup failed: {e} - Set default settings module for Django")
        sys.exit(1)

    # -----------------------------------
    # :: Import execute_from_command_line
    # -----------------------------------

    """
    Import Django's command-line utility
    """

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

    # -----------------------------------
    # :: Execute Command Line
    # -----------------------------------

    """
    Run command-line tasks provided by sys.argv
    """

    try:
        execute_from_command_line(sys.argv)
        sys.exit(1)
    except Exception as e:
        logging.error(f"Execution failed: {e}")


# -----------------------------------
# :: CALL MAIN FUNCTION
# -----------------------------------
"""
Calling Django's command-line utility for administrative tasks.
"""


if __name__ == '__main__':
    main()
