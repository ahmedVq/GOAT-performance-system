"""
Google Sheets API client.
Wraps authentication and raw data fetching. No business logic here.
"""
import logging
from typing import Optional
from django.conf import settings
from google.oauth2 import service_account
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

logger = logging.getLogger(__name__)

SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly']


class SheetsClient:
    def __init__(self):
        self._service = None

    def _get_service(self):
        if self._service:
            return self._service
        creds = service_account.Credentials.from_service_account_file(
            str(settings.GOOGLE_SHEETS_CREDENTIALS_FILE),
            scopes=SCOPES,
        )
        self._service = build('sheets', 'v4', credentials=creds)
        return self._service

    def get_sheet_names(self, spreadsheet_id: str) -> list[str]:
        """Return all tab names in a spreadsheet."""
        try:
            meta = self._get_service().spreadsheets().get(
                spreadsheetId=spreadsheet_id
            ).execute()
            return [s['properties']['title'] for s in meta.get('sheets', [])]
        except HttpError as e:
            logger.error('Failed to get sheet names: %s', e)
            raise

    def get_tab_values(self, spreadsheet_id: str, tab_name: str) -> list[list]:
        """Return all cell values from a single tab as a 2D list."""
        try:
            result = self._get_service().spreadsheets().values().get(
                spreadsheetId=spreadsheet_id,
                range=f"'{tab_name}'!A1:H60",
                valueRenderOption='UNFORMATTED_VALUE',
            ).execute()
            return result.get('values', [])
        except HttpError as e:
            logger.error('Failed to read tab "%s": %s', tab_name, e)
            raise


def get_client() -> SheetsClient:
    return SheetsClient()
