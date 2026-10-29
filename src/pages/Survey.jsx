import { useEffect, useState } from "preact/hooks";
import { useLocation } from "preact-iso";
import { getSurveyQuestions, submitSurvey } from "../lib/surveys";
import { watchSlip } from "../lib/slips";

export function Survey({ params }) {
  const { route } = useLocation();
  const [slip, setSlip] = useState(undefined);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [college, setCollege] = useState("");
  const [ratings, setRatings] = useState({});
  const [improvement, setImprovement] = useState("");

  useEffect(() => {
    return watchSlip(params.id, (value) => {
      setSlip(value);
      if (value?.leaderName) setName((current) => current || value.leaderName);
    });
  }, [params.id]);

  useEffect(() => {
    let active = true;
    getSurveyQuestions()
      .then((list) => {
        if (active) {
          setQuestions(list);
          setRatings(Object.fromEntries(list.map((_, index) => [`q${index + 1}`, 5])));
        }
      })
      .catch(() => {
        if (active) setError("Unable to load the survey. Please try again.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (submitting) return;
    if (!questions.every((_, index) => Number(ratings[`q${index + 1}`]) >= 1 && Number(ratings[`q${index + 1}`]) <= 5)) {
      setError("Please rate each question from 1 to 5.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      await submitSurvey(params.id, { name, college, ratings, improvement });
      route(`/slips/${params.id}`);
    } catch (err) {
      setError("Unable to submit the survey. Please try again.");
      setSubmitting(false);
    }
  }

  if (slip === undefined || loading) return <p>Loading survey...</p>;
  if (slip === null) return <p>Slip not found.</p>;

  return (
    <div class="survey">
      <h2>Satisfaction survey</h2>
      <p>Your feedback helps improve the equipment borrowing service.</p>
      <form onSubmit={handleSubmit}>
        <label>Name (optional)
          <input value={name} onInput={(event) => setName(event.currentTarget.value)} />
        </label>
        <label>College
          <input value={college} onInput={(event) => setCollege(event.currentTarget.value)} />
        </label>

        <h3>Rate each item from 1 (lowest) to 5 (highest)</h3>
        {questions.map((question, index) => {
          const key = `q${index + 1}`;
          return (
            <fieldset class="survey-question" key={key}>
              <legend>{question}</legend>
              <div class="survey-ratings">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <label key={rating}>
                    <input
                      type="radio"
                      name={key}
                      value={rating}
                      checked={Number(ratings[key]) === rating}
                      onChange={() => setRatings((current) => ({ ...current, [key]: rating }))}
                      required
                    />
                    {rating}
                  </label>
                ))}
              </div>
            </fieldset>
          );
        })}

        <label>What could we improve? (optional)
          <textarea value={improvement} onInput={(event) => setImprovement(event.currentTarget.value)} rows="4" />
        </label>

        {error && <p class="error" role="alert">{error}</p>}
        <div class="actions">
          <a href={`/slips/${params.id}`}>Skip survey</a>
          <button class="btn" type="submit" disabled={submitting || questions.length === 0}>
            {submitting ? "Submitting..." : "Submit survey"}
          </button>
        </div>
      </form>
    </div>
  );
}
