// The number is an input too, so people can type "20" instead of tapping + twenty times.
export function QtyStepper({ value, max, onChange }) {
  return (
    <div class="stepper">
      <button type="button" class="stepper-btn" aria-label="Decrease"
        disabled={value <= 0} onClick={() => onChange(value - 1)}>−</button>
      <input class="stepper-input" type="number" inputMode="numeric" min="0" max={max}
        value={value} onInput={(e) => onChange(e.currentTarget.value)} />
      <button type="button" class="stepper-btn" aria-label="Increase"
        disabled={value >= max} onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}