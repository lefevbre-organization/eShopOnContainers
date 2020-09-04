import pandas as pd
import numpy as np
from time import time
from sklearn.model_selection import cross_val_score
from sklearn.model_selection import GridSearchCV
import imports
from imports import descriptors, model , results
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from sklearn.metrics import confusion_matrix
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score

#dataSets=['../all1.csv','../all2.csv','../all3.csv','../kaminski1.csv','../kaminski2.csv',]
dataSets=['./data/all1.csv']

for dataSet in dataSets:
    ##############################################################################
    # Dataset
    df = pd.read_csv(dataSet, na_values=['?'],header=0)
    df["features"] = df['content'].map(str)+df['X-From'].map(str)+df['Subject'].map(str)
    #X=df['stem_tokens']
    X=df['features']
    y=df['class']
    n_classes=y.unique()

    ###############################################################################
    # Descriptors
    X=descriptors.tf_idf(X)
    #X=descriptors.frequence(X)

    # #############################################################################
    # Split into a training set and a test set using a stratified k fold

    # split into a training and testing set
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42)

    # #############################################################################
    # Train classification model

    print("Fitting the classifier to the training set")
    t0 = time()
    ## test Keras
    #clf=model.keras(X.shape[1])
    #clf = clf.fit(X_train, y_train)
    ## test decision tree
    #clf=model.decision_tree( X_train,y_train)
    ## test naive bayes
    #clf=model.naiveBayes(X_train,y_train)
    ## test svm
    clf= model.SVM()
    clf = clf.fit(X_train, y_train)
    ## test neural network
    #clf=model.neural_network();
    #clf=clf.fit(X_train, y_train)


    print("done in %0.3fs" % (time() - t0))
    print("The best model for: {}\n".format(dataSet))
    print("- best score  : {}\n".format(clf.best_score_))
    print("- best params : {}\n".format(clf.best_params_))
    print("- best estimator : {}\n".format(clf.best_estimator_))

    # #############################################################################
    # Quantitative evaluation of the model quality on the test set

    print("Predicting mail folder on the test set")
    t0 = time()
    y_pred = clf.predict(X_test)
    print("done in %0.3fs" % (time() - t0))

    print("Score on the test set : {}".format(accuracy_score(y_test, y_pred)))

    print(classification_report(y_test, y_pred, labels=n_classes))
    results.plot_confusion_matrix(confusion_matrix(y_test, y_pred, labels=n_classes), n_classes, title='Confusion matrix, without normalization')
    # F1 score : the harmonic mean of precision and recall
    # support : The number of occurrences of each label in y_true
