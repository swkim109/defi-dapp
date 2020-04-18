import React from 'react';
import { Modal, Card, Button, Box, Flex, Heading, Text } from 'rimble-ui'

export default ({isOpen, msg, closeModal, title = 'Failed Transaction'}) => {

    return (
        <Modal isOpen={isOpen}>
            <Card width={"640px"} p={0}>
                <Button.Text
                    icononly
                    icon={"Close"}
                    color={"moon-gray"}
                    position={"absolute"}
                    top={0}
                    right={0}
                    mt={3}
                    mr={3}
                    onClick={closeModal}
                />

                <Box p={4} mb={3}>
                    <Heading.h3>{title}</Heading.h3>
                    <Text>{msg}</Text>
                </Box>

                <Flex
                    px={4}
                    py={3}
                    borderTop={1}
                    borderColor={"#E8E8E8"}
                    justifyContent={"flex-end"}
                >
                    <Button.Outline onClick={closeModal}>Close</Button.Outline>
                </Flex>
            </Card>
        </Modal>
    )
}
