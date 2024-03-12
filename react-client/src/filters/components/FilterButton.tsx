import {
  Box,
  Button,
  Flex,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverFooter,
  Portal,
} from "@chakra-ui/react";
import { MdOutlineKeyboardArrowDown, MdOutlineKeyboardArrowUp } from "react-icons/md";

export default function FilterButton({
  label,
  icon,
  content,
  isOpen,
  onOpen,
  onClose,
  onSelect,
  handleSave,
  handleReset,
}) {
  return (
    <Popover placement="bottom" isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      {({ onClose }) => (
        <>
          <PopoverTrigger>
            <Button
              leftIcon={icon}
              rightIcon={isOpen ? <MdOutlineKeyboardArrowUp size={20} /> : <MdOutlineKeyboardArrowDown size={20} />}
            >
              {label}
            </Button>
          </PopoverTrigger>
          <Portal>
            <PopoverContent w={"fit-content"}>
              <PopoverBody m={5}>
                <Box>{content(onSelect)}</Box>
              </PopoverBody>
              <PopoverFooter>
                <Flex justifyContent="space-between">
                  <Button
                    mt={1}
                    rounded={"xl"}
                    colorScheme="gray"
                    onClick={() => {
                      handleReset();
                      onClose();
                    }}
                  >
                    Remove
                  </Button>
                  <Button
                    mt={1}
                    rounded={"xl"}
                    colorScheme="blue"
                    onClick={() => {
                      handleSave();
                      onClose();
                    }}
                  >
                    Apply
                  </Button>
                </Flex>
              </PopoverFooter>
            </PopoverContent>
          </Portal>
        </>
      )}
    </Popover>
  );
}
