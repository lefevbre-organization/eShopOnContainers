import getpass
from collections import defaultdict
from exchangelib import Account, Configuration, Credentials, DELEGATE

def connect(server, email, username, password):
    """
    Get Exchange account cconnection with server
    """
    creds = Credentials(username=username, password=password)
    config = Configuration(server=server, credentials=creds)
    return Account(primary_smtp_address=email, autodiscover=False, config = config, access_type=DELEGATE)

def print_tree(account):
    """
    Print folder tree
    """
    print(account.root.tree())

def get_recent_emails(account, folder_name, count):
    """
    Retrieve most emails for a given folder
    """
    # Get the folder object
    folder = account.root / 'Principio del almacén de información' / folder_name
    # Get emails
    return folder.all().order_by('-datetime_received')[:count]

def count_senders(emails):
    """
    Given emails, provide counts of sender by name
    """
    counts = defaultdict(int)
    for email in emails:
        counts[email.sender.name] += 1
    return counts

def print_non_replies(emails, agents):
    """
    Print subjects where no agents have replied
    """
    dealt_with = dict()
    not_dealt_with = dict()
    not_dealt_with_list = list()
    for email in emails: # newest to oldest
        # Simplify subject
        subject = email.subject.lower().replace('re: ', '').replace('fw: ', '')

        if subject in dealt_with or subject in not_dealt_with:
            continue
        elif email.sender.name in agents:
            # If most recent email was from an agent it's been dealt with
            dealt_with[subject] = email
        else:
            # Email from anyone else has not been dealt with
            not_dealt_with[subject] = email
            not_dealt_with_list += [email.subject]

    print('NOT DEALT WITH:')
    for subject in not_dealt_with_list:
        print(' * ', subject)

def main():
    # Connection details
    server = 'outlook.office365.com'
    email = 'a.valverde-ext@lefebvre.es'
    username = 'a.valverde-ext@lefebvre.es'
    password = 'Abril1971.-.-.-'
               #getpass.getpass()

    account = connect(server, email, username, password)

    # Print folder tree
    # print_tree(account)

    emails = get_recent_emails(account, 'Bandeja de entrada', 50)

    # Count senders by From name
    counts = count_senders(emails)
    print(counts)

    # Identify emails without a response
    agents = {
        'John':True,
        'Jane':True,
    }
    print_non_replies(emails, agents)

if __name__ == '__main__':
    main()