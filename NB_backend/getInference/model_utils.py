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
        self.classes = None
        self.feature_given_class = {}
        self.priori_of_class = {}
        
    def fit(self, df_containing_features, classes):
        self.classes = np.unique(classes)
        no_of_data_provided = len(classes)
        
        # Calculate prior probabilities with Laplace smoothing
        unique_classes, count_of_unique_classes = np.unique(classes['employee_residence'], return_counts=True)
        self.priori_of_class = dict(zip(unique_classes, (count_of_unique_classes + 1)/(no_of_data_provided + len(unique_classes))))
        
        # Calculate feature probabilities with Laplace smoothing
        columns = df_containing_features.columns
        probability_of_feature_and_class = {}
        probability_of_features = {}
        
        for column in columns:
            unique_features_in_column, count_of_unique_features_in_column = np.unique(df_containing_features[column], return_counts=True)
            
            # Calculate P(feature) with smoothing
            probability_of_features.update(
                dict(zip(unique_features_in_column, 
                        (count_of_unique_features_in_column + 1)/(no_of_data_provided + len(unique_features_in_column))))
            )
            
            for feature in unique_features_in_column:
                for Class in self.classes:
                    condition = (df_containing_features[column]==feature) & (classes['employee_residence']==Class)
                    count = np.sum(condition)
                    # Apply Laplace smoothing for conditional probabilities
                    class_count = np.sum(classes['employee_residence']==Class)
                    probability_of_feature_and_class[(feature,Class)] = (count + 1)/(class_count + len(unique_features_in_column))
                    
                    # Calculate P(feature|class) using Bayes theorem
                    self.feature_given_class[(feature,Class)] = probability_of_feature_and_class[(feature,Class)]

    def predict_with_steps(self, df_containing_features):
        predictions = pd.DataFrame({'employee_residence':[]})
        calculation_steps = []
        
        for row in df_containing_features.itertuples(index=False):
            probability_of_being_class = {}
            feature_contributions = {Class: [] for Class in self.classes}
            
            for Class in self.classes:
                # Start with log of prior probability
                log_probability = np.log(self.priori_of_class[Class])
                
                for feature in row:
                    # Get likelihood with smoothing for unseen features
                    likelihood = self.feature_given_class.get((feature, Class), 1.0/len(self.classes))
                    # Add log of likelihood
                    log_probability += np.log(likelihood)
                    
                    feature_contributions[Class].append({
                        'feature': str(feature),
                        'likelihood': float(likelihood)
                    })
                
                # Convert back from log space
                probability_of_being_class[Class] = float(np.exp(log_probability))
            
            # Normalize probabilities
            total = sum(probability_of_being_class.values())
            final_probabilities = {
                k: v/total if total > 0 else 1.0/len(self.classes)
                for k, v in probability_of_being_class.items()
            }
            
            step_data = {
                'final_probabilities': final_probabilities,
                'feature_contributions': feature_contributions
            }
            calculation_steps.append(step_data)
            
            # Add prediction
            predicted_class = max(probability_of_being_class, key=probability_of_being_class.get)
            predictions.loc[len(predictions)] = predicted_class
        
        return predictions, calculation_steps

    def predict(self, df_containing_features):
        predictions, _ = self.predict_with_steps(df_containing_features)
        return predictions

    def get_probabilities(self, df_containing_features):
        _, calculation_steps = self.predict_with_steps(df_containing_features)
        return calculation_steps[0]['final_probabilities'] if calculation_steps else {}

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
