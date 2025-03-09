# Project Name

## Overview
This project is a web application that uses Employment attributes of many people to train a Naive Bayes based model for predicting the nationality of the people based on the attributes provided. There was 70% accuracy on the model as tested previously on notebook.

Developed using React & Django.

## Project Structure


## Backend
The backend is a Django application located in the `NB_backend` directory. It includes:
- `ds_salaries.csv`: Dataset used for training the model.
- `trained_model.joblib`: Trained machine learning model.
- `getInference/`: Django app for handling inference requests.

### Running the Backend

1. Create  virtual environment using venv.
```sh
python -m venv env
```
2. Activate the  virtual environment.
- On Windows
```sh
./env/Scripts/activate
```
- On Linux
```sh
source ./env/bin/activate
```
3. Navigate to the `NB_backend` directory.
4. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```
5. Apply migrations:
    ```sh
    python manage.py migrate
    ```
6. Run the development server:
    ```sh
    python manage.py runserver
    ```

## Frontend
The frontend is a React project created using vite@latest and located in the `NB_frontend` directory. 

### Running the Frontend
1. Navigate to the `NB_frontend` directory.
2. Install dependencies:
    ```sh
    npm install
    ```
3. Run the development server:
    ```sh
    npm run dev
    ```