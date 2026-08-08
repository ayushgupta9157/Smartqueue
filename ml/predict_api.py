from flask import Flask, request, jsonify
import pandas as pd
import joblib

app = Flask(__name__)

model = joblib.load("wait_time_model.pkl")


@app.route("/predict", methods=["POST"])
def predict():

    try:

        data = request.get_json()

        input_data = pd.DataFrame([{
            "hour": data["hour"],
            "day_of_week": data["dayOfWeek"],
            "doctor_daily_load": data["doctorDailyLoad"]
        }])

        prediction = model.predict(input_data)[0]

        return jsonify({
            "predictedWaitTime": round(float(prediction), 2)
        })

    except Exception as error:

        return jsonify({
            "error": str(error)
        }), 500


if __name__ == "__main__":
    app.run(
        host="127.0.0.1",
        port=5001,
        debug=True
    )