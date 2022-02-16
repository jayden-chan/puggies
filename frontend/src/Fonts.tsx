import { Global } from "@emotion/react";

const Fonts = () => (
  <Global
    styles={`
      /* latin */
      @font-face {
          font-family: 'Nimbus Sans';
          src: url('/assets/fonts/NimbusSanL-Reg.woff') format('woff');
          font-weight: normal;
          font-style: normal;
      }
      /* latin */
      @font-face {
          font-family: 'Nimbus Sans';
          src: url('/assets/fonts/NimbusSanL-Bol.woff') format('woff');
          font-weight: bold;
          font-style: normal;
      }
      `}
  />
);

export default Fonts;
