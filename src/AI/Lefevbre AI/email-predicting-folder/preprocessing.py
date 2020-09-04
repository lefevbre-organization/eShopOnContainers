#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Created on Mon Dec 11 17:04:04 2017

@author: chaka
"""
import os,sys, email, re
import pandas as pd


input_path = '../emails'
output_path = '../emails.csv'
# Read the data into a DataFrame
emails_df = pd.read_csv(input_path)
print(emails_df.shape)   

def get_text_from_email(msg):
    '''To get the content from email objects'''
    parts = []
    for part in msg.walk():
        if part.get_content_type() == 'text/plain':
            parts.append(part.get_payload())
    return ''.join(parts)

def split_email_addresses(line):
    '''To separate multiple email addresses'''
    if line:
        addrs = line.split(',')
        addrs = frozenset(map(lambda x: x.strip(), addrs))
    else:
        addrs = None
    return addrs

#Parse the emails into a list email objects
messages = list(map(email.message_from_string, emails_df['message']))
emails_df.drop('message',axis=1, inplace=True)
print("Parse the emails into a list email objects")
#Get fields from parsed email objects
keys = messages[0].keys()
for key in keys:
    emails_df[key] = [doc[key] for doc in messages]
print("Get fields from parsed email objects")
#Parse content from emails
emails_df['content'] = list(map(get_text_from_email, messages))
print("Parse content from emails")
#Split multiple email addresses
emails_df['From'] = emails_df['From'].map(split_email_addresses)
emails_df['To'] = emails_df['To'].map(split_email_addresses)
print("Split multiple email addresses")
#Extract the root of 'file' as 'user'
emails_df['user'] = emails_df['file'].map(lambda x:x.split('/')[0])
emails_df['class'] = emails_df['file'].map(lambda x:x.split('/')[1])
del messages
print("Extract the root of 'file' as 'user'")
#emails_df.head()

#Set index and drop columns with two few values
emails_df = emails_df.set_index('Message-ID').drop(['file','Mime-Version','Content-Type', 'Content-Transfer-Encoding'], axis=1)
print("Set index and drop columns with two few values")

emails_df['class'].value_counts()
os.remove(input_path)
#emails_df = emails_df.head(350000)
emails_df.to_csv(output_path,sep=',')
