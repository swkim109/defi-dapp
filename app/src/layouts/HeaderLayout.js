import styled from "styled-components";

const HeaderLayout = styled.div`
  //display: flex;
  //justify-content: space-between;
  background-color: blue;
  height: ${props => props.height || '100px'};;
  font-weight: bold;
  font-size: 30px;
  letter-spacing: 0.5px; 
  color: white;
  padding: 10px 10px 10px 10px; 
`;

export default HeaderLayout;
