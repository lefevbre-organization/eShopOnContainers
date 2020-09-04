import dialogflow
from google.api_core.exceptions import InvalidArgument
from SpellCorrector import *

import os
from google.oauth2 import service_account

def dialogflowClient(phrase):
    # Attributes
    DIALOGFLOW_PROJECT_ID = 'lefebvre-ivivrs'
    DIALOGFLOW_LANGUAGE_CODE = 'en-ES'
    GOOGLE_APPLICATION_CREDENTIALS = 'lefebvre-ivivrs-c18aa8f99956.json'
    SESSION_ID = '115760287604807540329'

    credentials = service_account.Credentials.from_service_account_file("lefebvre-ivivrs-c18aa8f99956.json")
    scoped_credentials = credentials.with_scopes(['https://www.googleapis.com/auth/cloud-platform'])

    # Correcting the spelling
    correctedPhrase = getSpellCorrectedPhrase(phrase)

    # Initializing a client
    session_client = dialogflow.SessionsClient(credentials=credentials)

    session = session_client.session_path(DIALOGFLOW_PROJECT_ID, SESSION_ID)

    text_input = dialogflow.types.TextInput(text=correctedPhrase, language_code=DIALOGFLOW_LANGUAGE_CODE)

    query_input = dialogflow.types.QueryInput(text=text_input)

    try:
        response = session_client.detect_intent(session=session, query_input=query_input)
    except InvalidArgument:
        raise

    print("Query text:", response.query_result.query_text)
    print("Detected intent:", response.query_result.intent.display_name)
    print("Detected intent confidence:", response.query_result.intent_detection_confidence)
    print("Response:", response.query_result.fulfillment_text)

dialogflowClient("hola")


