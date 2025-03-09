# Project Name

## Overview
This project is a web application that consists of a backend and a frontend. The backend is built using Django and provides APIs for inference using a trained machine learning model. The frontend is built using a modern JavaScript framework and interacts with the backend to display results to the user.

## Project Structure


## Backend
The backend is a Django application located in the `NB_backend` directory. It includes:
- `manage.py`: Django's command-line utility.
- `db.sqlite3`: SQLite database file.
- `ds_salaries.csv`: Dataset used for training the model.
- `trained_model.joblib`: Trained machine learning model.
- `getInference/`: Django app for handling inference requests.

### Running the Backend
1. Navigate to the `NB_backend` directory.
2. Install dependencies:
    ```sh
    pip install -r requirements.txt
    ```
3. Apply migrations:
    ```sh
    python manage.py migrate
    ```
4. Run the development server:
    ```sh
    python manage.py runserver
    ```

## Frontend
The frontend is located in the `NB_frontend` directory. It includes:
- `index.html`: Main HTML file.
- `src/`: Source code for the frontend application.

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

## Environment Setup
The project uses a virtual environment located in the `NB_env` directory. To activate the virtual environment:
- On Windows:
    ```sh
    NB_env\Scripts\activate
    ```
- On Unix or MacOS:
    ```sh
    source NB_env/bin/activate
    ```
