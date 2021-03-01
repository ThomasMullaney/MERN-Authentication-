import React from "react";

// Avatar but must update schema first

function Avatar(props) {
  return (
    <img className="Avatar" src={props.user.avatarUrl} alt={props.user.name} />
  );
}

function UserInfo(props) {
  return (
    <div className="UserInfo">
      <Avatar user={props.user} />
      <div className="UserInfo-name">{props.user.name}</div>
    </div>
  );
}

function CommentText(props) {
  return <div className="Comment-text">{props.text}</div>;
}

function CommentInfo(props) {
  return (
    <div className="CommentInfo">
      <CommentText user={props.user} />
      <div className="Comment-date">{formatDate(props.date)}</div>
    </div>
  );
}

function Comment(props) {
  return (
    <div className="Comment">
      <div className="UserInfo">
        <UserInfo user={props.author} />
      </div>
      <div className="CommentInfo">
          <CommentInfo user={props.author} />
      </div>
    </div>
  );
}


// pseduo code for like rating
this.setState((state, props) => ({
    counter: state.counter + props.increment
}));

// pseduo code for message board
class Comment extends React.Component {
    constructor(props) {
        super(props);
        this.setState = {
            posts: [],
            comments: [],
        };
    }


    componentDidMount() {
        fetchPosts().then(response => {
            this.setState({
                posts: response.posts
            });
        });

        fetchComments().then(response => {
            this.setState({
                comments: response.comments
            });
        });
    }
}

// example onClick handler
function ActionLink() {
    function handleClick(e) {
        e.preventDefault();
        console.log("the link was clicked.");
    }

    return (
        <a href="#" onClick={handleClick}>
            Click Me
        </a>
    )
}

// example toggle button 
class Toggle extends React.Component {
    constructor(props) {
        super(props);
        this.state = {isToggleOn: true};

        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.setState(state => ({
            isToggleOn: !state.isToggleOn
        }));
    }

    render() {
        return (
            <button onClick={this.handleClick}>
                {this.state.isToggleON ? 'ON' : 'OFF'}
            </button>
        );
    }
}

ReactDOM.render(
    <Toggle />,
    document.getElementById('root')
);

// example of handleClick without binding using "class fields syntax"

class LikeButton extends React.Component {
    handleClick = () => {
        console.log('this is:', this);
    }

    render() {
        return (
            <button onClick={this.handleClick.bind(this, id)}>
                Delete Me
            </button>
        )
    }
}

// example of no binding without "class fields syntax" - issue is different callback is created each time the class component renders
// if this callback is passed as a prop to lower compoenents those compopnents may do rerendering.
class LikeButton extends React.Component {
    handleClick() {
        console.log("this is:", this);
    }

    render(){
        return (
            <button onClick={(e) => this.handleClick(id, e)}>
                Like Comment
            </button>
        )
    }
}

// passing arguments to event handlers

