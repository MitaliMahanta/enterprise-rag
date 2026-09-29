import json

from retrieval_evaluator import RetrievalEvaluator


with open(
    "tests/evaluation_questions.json",
    "r"
) as file:

    questions = json.load(file)


evaluator = RetrievalEvaluator()


for item in questions:

    result = evaluator.evaluate_question(
        item["question"],
        item["expected_topic"]
    )

    print("\n" + "=" * 60)

    print(
        f"Question: {result['question']}"
    )

    print(
        f"Latency: {result['latency']:.3f}s"
    )

    for index, match in enumerate(
        result["results"],
        start=1
    ):

        print(
            f"{index}. "
            f"Score={match['score']:.3f} "
            f"Relevant={match['contains_expected_topic']}"
        )