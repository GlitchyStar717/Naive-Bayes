from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
import numpy as np
from .model_utils import trained_model
import time
# from django.shortcuts import render, HttpResponse


# Create your views here.
def convert_to_serializable(obj):
    if isinstance(obj, (np.integer, np.floating)):
        if np.isnan(obj) or np.isinf(obj):
            return 0.0
        return float(obj)
    elif isinstance(obj, np.ndarray):
        return [convert_to_serializable(x) for x in obj]
    elif isinstance(obj, dict):
        return {key: convert_to_serializable(value) for key, value in obj.items()}
    elif isinstance(obj, (list, tuple)):
        return [convert_to_serializable(item) for item in obj]
    elif pd.isna(obj):
        return 0.0
    return obj

def normalize_probabilities(probabilities):
    if isinstance(probabilities, dict):
        total = sum(filter(lambda x: x >= 0, probabilities.values()))
        if total == 0:
            num_classes = len(probabilities)
            return {k: 1.0/num_classes for k in probabilities.keys()}
        return {k: (v/total if v >= 0 else 0.0) for k, v in probabilities.items()}
    return probabilities

@api_view(['POST'])
def run_script(request):
    global trained_model
    if (trained_model is None):
        return Response({'result':'Model hasn\'t loaded yet.'})

    try:
        input_data = request.data.get('value','')
        df = pd.DataFrame([input_data])
        
        # Get predictions and calculations
        predictions, calculation_steps = trained_model.predict_with_steps(df)
        
        # Add prior probabilities to the calculation steps
        prior_probabilities = trained_model.priori_of_class
        total_prior = sum(prior_probabilities.values())
        normalized_priors = {
            country: (prob / total_prior) 
            for country, prob in prior_probabilities.items()
        }
        
        # Get the final probabilities
        final_probs = calculation_steps[0]['final_probabilities']
        total = sum(final_probs.values())
        normalized_probs = {k: (v/total) for k, v in final_probs.items()}
        
        # Get the predicted country and its probability
        predicted_country = max(normalized_probs.items(), key=lambda x: x[1])
        
        # Update calculation steps with both prior and posterior probabilities
        calculation_steps[0].update({
            'class_probabilities': {
                country: {'prior': prob} 
                for country, prob in normalized_priors.items()
            },
            'final_probabilities': normalized_probs
        })
        
        # Convert to serializable format
        serializable_steps = convert_to_serializable(calculation_steps)
        
        response_data = {
            'result': [
                {
                    "country": str(predicted_country[0]), 
                    "confidence": float(predicted_country[1])
                }
            ],
            'calculation_steps': serializable_steps
        }
        
        print("Debug - Prior Probabilities:", calculation_steps[0]['class_probabilities'])
        
        return Response(response_data)
        
    except Exception as e:
        print(f"Error in run_script: {str(e)}")
        return Response({
            'error': 'An error occurred during prediction',
            'details': str(e)
        }, status=500)
