import React from "react";
import styled from 'styled-components';
import {Button, Card, Text, Icon} from "rimble-ui"

const Cards = styled.div`
  max-width: 100%;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  margin: 80px auto;     
  
`;


export default function (props) {

    return (
                <Cards>
                    <Card width={"340px"} mx={"auto"}>
                        <Text mb={10} alignItems={"center"} display={"flex"}>
                            <Icon name={"Storage"} mr={2} />
                            SimpleStorage
                        </Text>
                        <Button.Outline as="a" href={"/simple"}>Go!</Button.Outline>
                    </Card>
                    <Card width={"340px"} mx={"auto"}>
                        <Text mb={10} alignItems={"center"} display={"flex"}>
                            <Icon name={"Equalizer"} mr={2} />
                            Lottery
                        </Text>
                        <Button.Outline as="a" href={"/lottery"}>Play!</Button.Outline>
                    </Card>
                    <Card width={"340px"} mx={"auto"}>
                        <Text>

                        </Text>
                    </Card>

                </Cards>

    );
}
