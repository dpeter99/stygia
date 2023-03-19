import { index } from './app/app.element';

index().toString().then((res)=>{
    document.getElementsByTagName("stygia-root")[0].innerHTML = res;
});