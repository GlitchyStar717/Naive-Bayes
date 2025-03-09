import time
import joblib
from sklearn.model_selection import train_test_split
import os
import pandas as pd
import numpy as np
from collections import defaultdict

MODEL_PATH = "trained_model.joblib"
trained_model = None  # Global variable to store the trained model
file_path = "ds_salaries.csv"

class NaiveBayesClassifier:
    def __init__(self):
        self.priori_of_class = {}
        self.feature_given_class = {}
        self.classes = []
        
    def fit(self, df_containing_features, classes ):
        self.classes = np.unique(classes)
        no_of_data_provided = len(classes)
        
        #Find the priori P(Class) of each nationality
        unique_classes, count_of_unique_classes = np.unique(classes, return_counts = True)
        for i in range(len(unique_classes)):
            self.priori_of_class[unique_classes[i]]=count_of_unique_classes[i] / no_of_data_provided

        #Find the P(Feature | Class) for each feature and class combination
        columns = df_containing_features.columns
        
            #Find the P(Feature) for every feature in every column
        probability_of_features = {}
        for column in columns:
            unique_features_in_column, count_of_unique_features_in_column = np.unique(df_containing_features[column],return_counts = True)
            for i in range(len(unique_features_in_column)):
                probability_of_features[unique_features_in_column[i]] = count_of_unique_features_in_column[i]/no_of_data_provided

            #Find the P(Feature & Class) for each feature and class combination
        probability_of_feature_and_class = defaultdict(lambda:defaultdict(float))
        for column in columns:
            unique_features_in_column, count_of_unique_features_in_column = np.unique(df_containing_features[column],return_counts = True)
            for feature in unique_features_in_column:
                for Class in unique_classes:
                    condition = (df_containing_features[column]==feature) & (classes['employee_residence']==Class)
                    count = np.sum(condition)
                    probability_of_feature_and_class[(feature,Class)]=count/no_of_data_provided
                    self.feature_given_class[(feature,Class)] = probability_of_feature_and_class[(feature,Class)]*probability_of_features[feature]/self.priori_of_class[Class]

    def predict(self,df_containing_features):
        predictions = pd.DataFrame({'employee_residence':[]})
        probability_of_being_class = {}
        for row in df_containing_features.itertuples(index=False):
            for Class in self.classes:
                class_given_features = self.priori_of_class[Class]
                for feature in row:
                    if(feature,Class) in self.feature_given_class:
                    #Not dividing my P(Features) since it's same irrespective of the Class, for each Class.                
                        class_given_features *= self.feature_given_class[(feature,Class)]
                    else:
                        class_given_features *= 1e-6
                probability_of_being_class[Class]=class_given_features
            predictions.loc[len(predictions)] = max(probability_of_being_class,key=probability_of_being_class.get)
        return predictions



def train_model():
    global trained_model
    print("Checking for the trained model.")
    if os.path.exists(MODEL_PATH):
        print("Trained model found. Loading it.")
        trained_model = joblib.load(MODEL_PATH)
    else:
        print("Trained model not found. Training it.")
        df = pd.read_csv(file_path)
        df = df.drop(columns=['Unnamed: 0','salary','salary_currency'])
        inputs = df.drop(columns = ['employee_residence'])
        outputs = pd.DataFrame(df['employee_residence'])
        train_data, validation_data, train_target, validation_target = train_test_split(inputs, outputs, test_size=0.05, random_state=717)
        trained_model = NaiveBayesClassifier()
        trained_model.fit(train_data,train_target)
        print("Training completed.")
        joblib.dump(trained_model, MODEL_PATH)  
        print("Model Dumped.")
