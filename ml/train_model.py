import pandas as pd

df = pd.read_csv("HospitalOPD-noname.csv")


# Remove completely empty column

df = df.drop(columns=["Unnamed: 2"])


# Convert datetime columns

df["appointment_start_datetime"] = pd.to_datetime(
    df["appointment_start_datetime"],
    errors="coerce"
)

df["prescription_start_datetime"] = pd.to_datetime(
    df["prescription_start_datetime"],
    errors="coerce"
)


# Remove missing datetime rows

df = df.dropna(
    subset=[
        "appointment_start_datetime",
        "prescription_start_datetime"
    ]
)


# Calculate waiting time in minutes

df["wait_time"] = (

    df["prescription_start_datetime"]
    -
    df["appointment_start_datetime"]

).dt.total_seconds() / 60

# Remove negative waiting time

df = df[df["wait_time"] >= 0]


# Remove extreme outliers using IQR

Q1 = df["wait_time"].quantile(0.25)
Q3 = df["wait_time"].quantile(0.75)

IQR = Q3 - Q1

upper_limit = Q3 + (1.5 * IQR)

df = df[df["wait_time"] <= upper_limit]


print("\nCleaned Wait Time Statistics:")

print(df["wait_time"].describe())

print("\nDataset Shape After Cleaning:")

print(df.shape)


print(df[[
    "appointment_start_datetime",
    "prescription_start_datetime",
    "wait_time"
]].head(10))


print("\nWait Time Statistics:")

print(df["wait_time"].describe())


# Feature Engineering

df["hour"] = df[
    "appointment_start_datetime"
].dt.hour

df["day_of_week"] = df[
    "appointment_start_datetime"
].dt.dayofweek


# Count appointments for same doctor on same date

df["appointment_date"] = df[
    "appointment_start_datetime"
].dt.date

df["doctor_daily_load"] = df.groupby([
    "prescription_doctor_id",
    "appointment_date"
])["appointment_id"].transform("nunique")


features = df[[
    "hour",
    "day_of_week",
    "doctor_daily_load",
    "wait_time"
]]


print("\nML Features:")

print(features.head(10))


print("\nFeature Statistics:")

print(features.describe())

from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
import joblib

X = df[[
    "hour",
    "day_of_week",
    "doctor_daily_load"
]]

y = df["wait_time"]


X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42
)




model = Pipeline([
    ("regressor", RandomForestRegressor(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    ))
])

print("\nTraining Model...")


model.fit(
    X_train,
    y_train
)


predictions = model.predict(X_test)


mae = mean_absolute_error(
    y_test,
    predictions
)

r2 = r2_score(
    y_test,
    predictions
)


print("\nModel Evaluation")

joblib.dump(
    model,
    "wait_time_model.pkl"
)

print("Model Saved Successfully")

print("MAE:", mae)

print("R2 Score:", r2)