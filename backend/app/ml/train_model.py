import argparse
import os

from app.ml.model_service import ModelService


def parse_args():
    parser = argparse.ArgumentParser(description="Train academic performance model")
    parser.add_argument("--data", required=True, help="Path to training CSV dataset")
    parser.add_argument(
        "--model-path",
        default="app/ml/trained_model.joblib",
        help="Path to save model file",
    )
    parser.add_argument(
        "--scaler-path",
        default="app/ml/scaler.joblib",
        help="Path to save scaler file",
    )
    return parser.parse_args()


def main():
    args = parse_args()

    data_path = os.path.abspath(args.data)
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Dataset not found: {data_path}")

    service = ModelService(model_path=args.model_path, scaler_path=args.scaler_path)
    metrics = service.train(data_path)

    print("Model training completed")
    print(f"Records: {metrics['records']}")
    print(f"Accuracy: {metrics['accuracy']:.4f}")
    print(f"Model saved to: {args.model_path}")
    print(f"Scaler saved to: {args.scaler_path}")


if __name__ == "__main__":
    main()
