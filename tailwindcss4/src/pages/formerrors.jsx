export default function FormErrors(props) {
  if (!props.errors || !props.errors.length) {
    return null;
  }
  const errors = props.errors.filter((error) => {
    // console.log({error,param:error.param,props:props.param})
    return props.param ? error.param === props.param : error.param === null;
  });

  if (!errors.length) {
    return null;
  }
  
  return (
    <ul className="text-red-600 text-sm">
      {errors.map((e, i) => (
        <li key={i}>{e.message}</li>
      ))}
    </ul>
  );
};
