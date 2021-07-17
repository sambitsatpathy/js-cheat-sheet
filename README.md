# js-cheat-sheet

# JavaScript
1. What is the difference between the keywords let and var?
2. Are these operations valid : 
2.1. const obj = {b:2}; 
     obj.a = 1;
     delete obj.a;
     obj.b = 3;
2.2. const arr = [1];
      arr.push(2);
      arr.pop();
      arr[0]=4;
3. What is meant by hoisting in javascript? Are functions hoisted? Are classes hoisted?
4. What are closures in javascript?
4.1. what is the output:
      function display(){
         let arr = []
          for(let a =0; a<4; a++){
              arr.push(function d(){
                  console.log(a)
              })
          }
      return arr
      }
      let resp = display();
      resp.forEach(d=>d());
5. What is the use of .bind, .call and .apply functions. Write the polyfill for each of them.
6. How is inheriance implemented in JS.
7. What is the diffence between __proto__ and prototype?
8. Explain how this keyword works.
9. Write a function to reverse the characters of any given given string using function chaining. 
    eg : "str".reverse() === "rts"; "str".reverse().reverse() === "str";
10. What are Immediately invoked function expressions(IIFE) and how are they used?
11. How does Nullish coalescing operator (??) work?
12. How is rest operator different from spread operator (both are ...)?
13. How does setTimeout/setInterval work?
14. What are event propagation and event delegation? Given the following DOM structure 
    <div id="parent" onclick="console.log('outer')"><div>Filler Piece</div><div id="child" onclick="console.log('inner')">Click me</div></div> 
    How would you proceed to prevent the onclick of the #parent from firing when the #child is clicked?
15. How does event loop work?
16. What is the order of console in the output?
16.1
    console.log("Start");
    setTimeout(()=>console.log('Set timeout'));
    Promise.resolve(console.log('Promise'));
    Promise.resolve(()=>{
      console.log('Promise2'));
      setTimeout(()=>console.log('Set timeout2'))
    }
    console.log("End");
    
16.2
    console.log("Start");
    setTimeout(()=>console.log('Set timeout'));
    Promise.resolve(console.log('Promise'));
    Promise.resolve((()=>{
      console.log('Promise2');
      setTimeout(()=>console.log('Set timeout2'));
    })())
    console.log("End")
    
17. What are micro-queue and macro-queue in JS?
18. What are Promises? What is the advantage of writing them with async/await ? 
19. What is callback hell? how does a Promise help to mitigate this? 
20. How does the .then keyword work?
21. How are clasess different from functions in JS?
22. How to make objects immutable?
23. What is the difference between an Object and a Map in JS?
24. What is the difference between an Array and a Set in JS?
    24.1. How do you ensure uniqueness in an Set of objects?
25. What are Symbols in JS? How are they used?
26. How to iterate over the keys of an object?
27. How many methods are there to create an object?
28. What are constructor functions?
29. How to invoke parent function/class method from inside the child function/class?
30. How to perform function overriding in JS?
31. What are decorators in JS?
32. What are generators in JS? How does the yield keyword work?


# React:
1. What is JSX? Can you write React code without using JSX?
2. What is use of ReactDOM? Can you have multiple React applications running in the same html at the same time?
3. What is the difference between props and state in react components?
4. What is the difference between stateful and stateless components/ functional and class components?
5. What is Context in React. How is it used?
6. What is lifting up of state in react?
7. What is the meaning of Composition in React components?
8. What is controlled and uncontrolled in React form components?
9. Why do we need key for list items in react? how is it used by react? why shouldnt we use array indices as keys?
10. What are Higher order components in react? How are they used?
11. What are the lifecyle methods in a react component? how are they useful?
12. How to make rendering of a component conditional?
13. How to conditionally update a react component?
14. What is the difference between a Component and a Pure Component in React?
15. What are hooks in react?
16. How to emulate lifecycle methods of a class component in React?
17. How to compare prevProps/prevState with current Props/State in a React Hook function?
18. What is React Suspense and how is it used to facilitate lazy loading of React components?
19. What is Virtual DOM in react? how does it work?
20. How does the virtual dom reconciliation to identify updated components work in react?


    
