import { Stygia, BaseComponent, TestComponent, P } from "./stygia/jsx-runtime";

class ObjectComponent extends BaseComponent{
  render() {
    return <div>
      Class: {this.props.src}
    </div>
  }
}

class DerivedComponent extends ObjectComponent{}

function BasicFuncComp(props:{name:string}) {
  return(
    <div id={"test"}>
      Function: {props.name}
    </div>
  )
}

function Header({ name }: { name: string }) {
  return (
    <header>
      <BasicFuncComp name={name} />
      <TestComponent test={{ name: "rtets", age: 10 }} user={name} />
    </header>
  );
}

export function test(name:string, update:(e:InputEvent)=>void)
{
  return <div>
    <input onInput={update} value={name}/>
    <p>{name}</p>
    <Header name={name}/>
  </div>
}
