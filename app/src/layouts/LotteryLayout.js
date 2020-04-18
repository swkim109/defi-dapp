import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: space-between;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 10px 10px 10px;
`;

const ManageGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin: 20px 10px 10px 10px;
`;

const CheckSlider = styled.div`
  display: flex;
  margin: 0 0 20px 0;
  width: 480px;
  justify-content: space-between;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  margin: 0 0 20px 0;
  width: 500px;
  justify-content: space-between;
`;

export {
    Container,
    CheckSlider,
    ButtonGroup,
    FormGroup,
    ManageGroup
}
