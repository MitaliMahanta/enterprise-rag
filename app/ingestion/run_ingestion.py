from app.ingestion.pipeline import IngestionPipeline


def main():
    pipeline = IngestionPipeline()
    count = pipeline.run()

    print(f"Ingestion completed: {count} chunks indexed.")


if __name__ == "__main__":
    main()