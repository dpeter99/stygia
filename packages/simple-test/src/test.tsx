import { Stygia, Component } from "./stygia/jsx-runtime";

class ObjectComponent extends Component{
  render() {
    return <test src={"test"}/>
  }
}

class DerivedComponent extends ObjectComponent{}

function BasicFuncComp(props:{name:string}) {
  return <div id={"test"}>
    {props.name}
  </div>
}

export function test(name:string, update:(e:InputEvent)=>void)
{
  return <div>
    <input onInput={update} value={name}/>
    {name}
    <p>{name}</p>
    <h1>
      Test
      {name}
      <BasicFuncComp name={name} />
      <ObjectComponent src={"asd"}></ObjectComponent>
      <DerivedComponent src={"asd2"}></DerivedComponent>
    </h1>
  </div>
}
