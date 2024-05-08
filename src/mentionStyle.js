export default {
    control: {
      backgroundColor: "#fff",
      overflow: "auto",
    },
  
    "&multiLine": {
      control: {
        minHeight: 63,
        maxHeight: 96,
        overflow: "auto",
      },
      highlighter: {
        padding: 9,
        maxHeight: 96,
        border: "1px solid transparent",
        overflow: "auto",
      },
      input: {
        padding: 9,
        border: "1px solid silver",
        overflow: "auto",
      },
    },
  
    "&singleLine": {
      display: "inline-block",
      width: 180,
  
      highlighter: {
        padding: 1,
        border: "2px inset transparent",
      },
      input: {
        padding: 1,
        border: "2px inset",
      },
    },
  
    suggestions: {
      list: {
        backgroundColor: "white",
        border: "1px solid rgba(0,0,0,0.15)",
        fontSize: 14,
      },
      item: {
        padding: "5px 15px",
        borderBottom: "1px solid rgba(0,0,0,0.15)",
        "&focused": {
          backgroundColor: "#cee4e5",
        },
      },
    },
  };