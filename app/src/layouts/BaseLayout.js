import styled from 'styled-components';

const BaseLayout = styled.div`
  padding: 10px 10px 0 10px; /* top right bottom left */
  font-family: 'Consolas', Arial, Helvetica, sans-serif;
  font-weight: normal;
  font-style: normal;
  color: black;
  
  table {
    border-collapse: collapse;
    border-spacing: 0;    
  }
  td,
  th {
    padding: 0;
    text-align: left;
  }  
`;

export default BaseLayout;
