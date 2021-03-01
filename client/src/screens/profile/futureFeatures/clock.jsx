import React from "react";

class Clock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {date: new Date()};
    }


    componentDidMount(){
        this.timerID = setInterval(
            () => this.tick(),
            1000
        );
    }

    componentWillUnmount(){
        clearInterval(this.timerID);
    }

    tick() {
        this.setState({
            date: new Date()
        });
    }

    render() {
        return (
            <div>
                <h1>Hello, world?</h1>
                <h2>It is {this.state.date.toLocaleTimeString()}.</h2>
            </div>
        );
    }
};

class FormatedDate extends React.Component {
    constructor(props) {
        super(props);
        this.setState({
            date:new Date()}
        )
    }
       
}

// example render
// ReactDOM.render(
//     <Clock />,
//      <Formatted Date date={this.state.date} />
//     document.getElementById('root')



// example of conditional rendering
function UserGreeting(props) {
    return <h1> Welcome  Back!</h1>;
}
function GuestGreeting(props) {
    return <h1>Please SignUP.</h1>
}

function Greeting(props) {
    const  isLoggedIn = props.isLoggedIn;
    if(isLoggedIn) {
        return <UserGreeting />;
    }
    return <GuestGreeting />;
}


// example of conditional rendering for a login/logout button
// stateful component
class LoginButtons extends React.Component {
    constructor(props){
        super(props);
        this.handleLoginClick = this.handleLoginClick.bind(this);
        this.handleLogoutClick= this.handleLogoutClick.bind(this);
        this.state = {isLoggedIn: false};
    }

LoginButton(props) {
    return (
        <button onClick={props.onClick}>
            Login
        </button>
    );
}

LogoutButton(props) {
    return (
        <button onClick={props.onClick}>
            Logout
        </button>
    );
}

handleLoginClick() {
    this.setState({isLoggedIn: true});
}

handleLogoutClick() {
    this.setState({isLoggedIn: false});
}

render() {
    const isLoggedIn = this.state.isLoggedIn;
    let button;
    if(isLoggedIn) {
        button = <LogoutButton onClick={this.handleLogoutClick} />;
    } else {
        button = <LoginButton onClick={this.handleLoginClick} />;
    }

    return (
        <div>
            <Greeting isLoggedIn={isLoggedIn} />
            {button}
        </div>
    );
}
}

ReactDOM.render(
    <LoginControl />,
    document.getElementById('root')
)


// lists and keys might be start to placing users on map

function NumberList(props) {
    const numbers = props.numbers;
    const listItems = numbers.map((number) =>
        <li key={number.toString()}>
            {number}
        </li>
        );
        return (
            <ul>{listItems}</ul>
        );
}

const numbers = [1, 2, 3, 4, 5];

ReactDom.Render(
   <NumberList numbers={numbers} />,
    document.getElementById('root')
);