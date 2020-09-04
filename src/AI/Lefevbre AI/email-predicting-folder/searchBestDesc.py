import pandas as pd
import itertools
import imports
from imports import descriptors, model
from sklearn import svm
from sklearn.feature_extraction.text import TfidfVectorizer, CountVectorizer
from sklearn.model_selection import train_test_split
from time import time
from sklearn.metrics import accuracy_score

dataSets=['./data/all1.csv']
fieldToTest=['content','X-From','Subject','all']
descriptors_list=['tf_idf','frequence']


def model(X,y):
    # #############################################################################
    # Split into a training set and a test set using a stratified k fold

    # split into a training and testing set
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    # #############################################################################
    # Train classification model
    #print("Fitting the classifier to the training set")
    t0 = time()
    clf=svm.SVC(C=100,gamma=0.01)
    clf.fit(X_train, y_train)

    # #############################################################################
    # Quantitative evaluation of the model quality on the test set
    #print("Predicting mail folder on the test set")
    t0 = time()
    y_pred = clf.predict(X_test)

    print("Score on the test set : {}\n".format(accuracy_score(y_test, y_pred)))

for dataSet in dataSets:
    #######################DATASET##################################################
    df = pd.read_csv(dataSet, na_values=['?'],header=0)
    for field in fieldToTest:
        if(field=='all'):
            df["features"] = df['content'].map(str)+df['X-From'].map(str)+df['Subject'].map(str)
        else:
            df["features"] = df[field].map(str)
        X=df["features"]
        y=df["class"]

        ########################DESCRIPTORS############################################
        for descriptor in descriptors_list:
            if(descriptor == "tf_idf"):
                norm = ['l1','l2']
                analyzer = ['word','char']

                for a in analyzer:
                    for n in norm:
                        vectorizer = TfidfVectorizer(sublinear_tf=True,stop_words='english', analyzer=a, norm=n)
                        res = vectorizer.fit_transform(X)
                        print("{} {} {} {} {}".format(dataSet,field,descriptor,a,n))
                        model(res,y)

            if(descriptor == "frequence"):
                res = descriptors.frequence(X)
                print("{} {} {}\n".format(dataSet,field,descriptor))
                model(res,y)
