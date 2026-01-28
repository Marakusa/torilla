export default function InputWithPrefix({
  type,
  step,
  min,
  id,
  name,
  prefix,
  value,
  onChange }: {
    type?: React.HTMLInputTypeAttribute | undefined,
    step?: string | number | undefined,
    min?: string | number | undefined,
    id?: string | undefined,
    name?: string | undefined,
    prefix?: string | undefined,
    value?: string | number | readonly string[] | undefined,
    onChange?: React.ChangeEventHandler<HTMLInputElement> | undefined
  }) {
  return (
    <div className="input-prefix">
      <span>{prefix}</span>
      <input type={type ?? "text"} step={step} min={min} id={id} name={name} value={value} className="text-field" onChange={onChange} />
    </div>
  );
}
