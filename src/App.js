import React from 'react';
import store from './app/store'
import { Provider } from 'react-redux'
import Preprocessing from './components/data/Preprocessing';
import Processing from './components/data/Processing';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from "@mui/material/styles";
import SimilarityCalculations from './components/data/SimilarityCalculations';
import SubApp from './SubApp'

/*
// Way of doing CSS styling if you dont need the theme component/colors.
// Use in the return like <Main> OTHER HTML CONTENT LIKE COMPONENTS <Main/>
const Main = styled.main`
  background-color: lightblue;
  position: fixed;
  height: calc(100% - 185px);
  width: 100%;
  padding: 1em;
  flex: 1;
  margin-left: 260px;
  height: calc(100% - 64px);
  width: calc(100% - 260px);
`;
*/

const theme = createTheme({
  palette: {
    primary: {
      main: '#2e2d40',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#5f78ee',
      contrastText: '#ffffff',
    },
    warning: {
      main: '#4f4f5f',
    },
    info: {
      main: '#2a293b',
      light: '#ffffff',
      dark: '#e9e9e9',
    },
  },
  typography: {
    fontFamily: "'PT Sans', sans-serif",
    subtitle2: {
      color: '#c0c0c6',
    },
    subtitle1: {
      color: '#2d2c39',
    },
    h4: {
      fontFamily: "'Comfortaa', sans-serif",
      fontSize: 26,
    }
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#4f4f5f',
        }
      }
    },
    MuiInputBase: {
      styleOverrides: {
        input: {
          color: 'white',
        }
      }
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: 'white',
        }
      }
    },
    MuiFormControl: {
      styleOverrides: {
        root: {
          backgroundColor: '#292839',
        }
      }
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            color: '#ffffff',
            backgroundColor: '#5f78ee',
          }
        }
      }
    },
    MuiSelect: {
      styleOverrides: {
        icon: {
          fill: '#c0c0c6',
        }
      }
    },
    MuiTabPanel: {
      styleOverrides: {
        root: {
          padding: 20,
          overflowY: "auto",
          maxHeight: "calc(100vh - 49px)",
        }
      }
    }
  }
});

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <SubApp />
        <Preprocessing />
        <Processing />
        <SimilarityCalculations />
      </ThemeProvider>
    </Provider>
  );
}


export default App;

