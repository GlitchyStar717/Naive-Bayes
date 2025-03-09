from rest_framework.decorators import api_view
from rest_framework.response import Response
import pandas as pd
from .model_utils import trained_model
# from django.shortcuts import render, HttpResponse


# Create your views here.
@api_view(['POST'])
def run_script(request):

    global trained_model
    if (trained_model is None):
        return Response({'result':'Model hasn\'t loaded yet.'})


    input_data = request.data.get('value','')
    print(input_data)
    df = pd.DataFrame([input_data])
    result = trained_model.predict(df)
    # result = f"Inferred: {input_data}"

    return Response({'result':result})
