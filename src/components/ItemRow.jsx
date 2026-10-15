import { QtyStepper } from "./QtyStepper";

export function ItemRow({ item, qty, onChange }) {
  const soldOut = item.availableQty <= 0;
  return (
    <li class={`item-row ${soldOut ? "sold-out" : ""}`}>
      <div class="item-info">
        <strong>{item.name}</strong>
        <small>{soldOut ? "Not available" : `${item.availableQty} available`}</small>
      </div>
      {!soldOut && <QtyStepper value={qty} max={item.availableQty} onChange={onChange} />}
    </li>
  );
}