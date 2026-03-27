import os

import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler


FEATURE_COLUMNS = ["attendance", "quiz_score", "assignment_score", "study_hours"]
GRADE_LABELS = ["Fail", "C", "B", "A"]


class ModelService:
    def __init__(self, model_path: str, scaler_path: str):
        self.model_path = model_path
        self.scaler_path = scaler_path
        self.model = None
        self.scaler = None

    def load(self) -> bool:
        if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
            self.model = joblib.load(self.model_path)
            self.scaler = joblib.load(self.scaler_path)
            return True
        return False

    def train(self, csv_path: str) -> dict:
        df = pd.read_csv(csv_path)

        missing_features = [col for col in FEATURE_COLUMNS if col not in df.columns]
        if missing_features:
            raise ValueError(f"Dataset missing required columns: {', '.join(missing_features)}")

        if "grade_label" in df.columns:
            target = df["grade_label"]
        elif "final_score" in df.columns:
            target = pd.cut(
                df["final_score"],
                bins=[-1, 49, 64, 79, 100],
                labels=GRADE_LABELS,
            )
        else:
            weighted_score = (
                0.25 * df["attendance"]
                + 0.30 * df["quiz_score"]
                + 0.35 * df["assignment_score"]
                + 0.10 * (df["study_hours"] * 10)
            )
            target = pd.cut(weighted_score, bins=[-1, 49, 64, 79, 100], labels=GRADE_LABELS)

        x = df[FEATURE_COLUMNS]
        y = target.astype(str)

        x_train, x_test, y_train, y_test = train_test_split(x, y, test_size=0.2, random_state=42)
        self.scaler = StandardScaler()
        x_train_scaled = self.scaler.fit_transform(x_train)
        x_test_scaled = self.scaler.transform(x_test)

        self.model = RandomForestClassifier(n_estimators=300, random_state=42)
        self.model.fit(x_train_scaled, y_train)

        accuracy = float(self.model.score(x_test_scaled, y_test))

        os.makedirs(os.path.dirname(self.model_path), exist_ok=True)
        joblib.dump(self.model, self.model_path)
        joblib.dump(self.scaler, self.scaler_path)

        return {"accuracy": accuracy, "records": len(df)}

    def predict(self, attendance: float, quiz_score: float, assignment_score: float, study_hours: float) -> dict:
        if self.model is None or self.scaler is None:
            loaded = self.load()
            if not loaded:
                raise FileNotFoundError("Trained model not found. Please train model first.")

        features = np.array([[attendance, quiz_score, assignment_score, study_hours]])
        scaled = self.scaler.transform(features)

        predicted_grade = self.model.predict(scaled)[0]
        probs = self.model.predict_proba(scaled)[0]
        class_labels = list(self.model.classes_)

        fail_idx = class_labels.index("Fail") if "Fail" in class_labels else None
        failure_probability = float(probs[fail_idx]) if fail_idx is not None else 0.0
        confidence = float(np.max(probs))

        if failure_probability >= 0.65:
            risk_level = "High"
        elif failure_probability >= 0.35:
            risk_level = "Medium"
        else:
            risk_level = "Low"

        return {
            "predicted_grade": predicted_grade,
            "risk_level": risk_level,
            "confidence": round(confidence, 4),
            "failure_probability": round(failure_probability, 4),
        }
