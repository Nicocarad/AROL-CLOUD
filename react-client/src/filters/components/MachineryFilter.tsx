import React, { useState, useContext, useEffect } from "react";
import {
  Checkbox,
  Box,
  Flex,
  Text,
  Stack,
  IconButton,
  Badge,
  RangeSlider,
  RangeSliderTrack,
  RangeSliderFilledTrack,
  RangeSliderThumb,
} from "@chakra-ui/react";
import { MdOutlineCategory } from "react-icons/md";
import { FaRegTrashCan } from "react-icons/fa6";
import { BiCategoryAlt } from "react-icons/bi";
import { FaHashtag } from "react-icons/fa";
import { TbMathLower, TbMathGreater } from "react-icons/tb";
import ToastHelper from "../../utils/ToastHelper";
import ToastContext from "../../utils/contexts/ToastContext";
import MachineryFilters from "../interfaces/MachineryFilters";
import FilterButton from "./FilterButton";
import { JSX } from "react/jsx-runtime";

interface MachineryFilterProps {
  machineryModels: string[];
  machineryTypes: string[];
  setMachineryFilter: React.Dispatch<React.SetStateAction<MachineryFilters>>;
  onPopoverChange: (popoverId: string | null) => void;
  callerType: "dashboards" | "documents" | "both";
  maxHeads: number;
  maxDashboards: number;
  maxDocuments: number;
  companyID: number;
}

export default function MachineryFilter(props: MachineryFilterProps) {
  const toast = useContext(ToastContext);

  const unsetModels = props.machineryModels.reduce((acc, key) => {
    return { ...acc, [key]: null };
  }, {});
  const unsetTypes = props.machineryTypes.reduce((acc, key) => {
    return { ...acc, [key]: null };
  }, {});

  const [openPopover, setOpenPopover] = useState<string | null>(null);

  const [models, setModels] = useState<{ [key: string]: boolean }>(unsetModels);
  const [selectedModels, setSelectedModels] = useState<{
    [key: string]: boolean;
  }>({});
  const [checkedModels, setCheckedModels] = useState<{
    [key: string]: boolean;
  }>(unsetModels);

  const [types, setTypes] = useState<{ [key: string]: boolean }>(unsetTypes);
  const [selectedTypes, setSelectedTypes] = useState<{
    [key: string]: boolean;
  }>({});
  const [checkedTypes, setCheckedTypes] = useState<{ [key: string]: boolean }>(
    unsetTypes
  );

  const [numHeads, setNumHeads] = useState<[number, number]>([
    0,
    props.maxHeads,
  ]);
  const [selectedNumHeads, setSelectedNumHeads] = useState<
    [number, number] | null
  >(null);

  const [numDashboards, setNumDashboards] = useState<[number, number]>([
    0,
    props.maxDashboards,
  ]);
  const [selectedNumDashboards, setSelectedNumDashboards] = useState<
    [number, number] | null
  >(null);

  const [numDocuments, setNumDocuments] = useState<[number, number]>([
    0,
    props.maxDocuments,
  ]);
  const [selectedNumDocuments, setSelectedNumDocuments] = useState<
    [number, number] | null
  >(null);

  useEffect(() => {
    if (props.machineryModels) {
      setModels(unsetModels);
      setCheckedModels(unsetModels);
    }
    if (props.machineryTypes) {
      setTypes(unsetTypes);
      setCheckedTypes(unsetTypes);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const CheckboxGroup = ({ handleChange, checkedItems, setCheckedItems }) => {
    return (
      <Stack spacing={2} mr={5} ml={5}>
        {Object.entries(checkedItems).map(([item]) => (
          <Checkbox
            key={item}
            defaultChecked={checkedItems[item]}
            onChange={() => {
              setCheckedItems((prevCheckedItems) => {
                const updatedItems = {
                  ...prevCheckedItems,
                  [item]: !prevCheckedItems[item],
                };
                handleChange(updatedItems);
                return updatedItems;
              });
            }}
          >
            {item}
          </Checkbox>
        ))}
      </Stack>
    );
  };

  const CustomSlider = ({ handleChange, min, max, defaultValue, label }) => {
    const [sliderValues, setSliderValues] = useState(defaultValue);

    return (
      <Box w={"250px"}>
        <RangeSlider
          min={min}
          max={max}
          defaultValue={defaultValue}
          onChangeEnd={() => handleChange(sliderValues)}
          onChange={setSliderValues}
          mt={2}
        >
          <RangeSliderTrack>
            <RangeSliderFilledTrack />
          </RangeSliderTrack>
          <RangeSliderThumb boxSize={6} index={0}>
            <Box as={TbMathLower} />
          </RangeSliderThumb>
          <RangeSliderThumb boxSize={6} index={1}>
            <Box as={TbMathGreater} />
          </RangeSliderThumb>
        </RangeSlider>
        <Text mt={4}>
          Number of {label} from <b> {sliderValues[0]} </b>to{" "}
          <b>{sliderValues[1]}</b>
        </Text>
      </Box>
    );
  };

  const handleFilterChange = (filterType: string, value: any) => {
    switch (filterType) {
      case "model":
        setModels(value);
        break;
      case "type":
        setTypes(value);
        break;
      case "heads":
        setNumHeads(value);
        break;
      case "dashboards":
        setNumDashboards(value);
        break;
      case "documents":
        setNumDocuments(value);
        break;
      default:
        ToastHelper.makeToast(toast, "Filter not applied", "warning");
        break;
    }
  };

  const handleSave = (filterType: string) => {
    let updatedFilter = {};

    switch (filterType) {
      case "model":
        updatedFilter = { models };
        if (!Object.values(models).some((modelID) => modelID)) {
          ToastHelper.makeToast(toast, "No model selected", "warning");
          return;
        }
        setSelectedModels(models);
        break;
      case "type":
        updatedFilter = { types };
        if (!Object.values(types).some((type) => type)) {
          ToastHelper.makeToast(toast, "No type selected", "warning");
          return;
        }
        setSelectedTypes(types);
        break;
      case "heads":
        updatedFilter = { numHeads: { min: numHeads[0], max: numHeads[1] } };
        setSelectedNumHeads(numHeads);
        break;
      case "dashboards":
        updatedFilter = {
          numDashboards: { min: numDashboards[0], max: numDashboards[1] },
        };
        setSelectedNumDashboards(numDashboards);
        break;
      case "documents":
        updatedFilter = {
          numDocuments: { min: numDocuments[0], max: numDocuments[1] },
        };
        setSelectedNumDocuments(numDocuments);
        break;
      default:
        ToastHelper.makeToast(toast, "Filter not applied", "warning");
        return;
    }

    ToastHelper.makeToast(toast, "Filter applied", "success");

    props.setMachineryFilter!((prevFilter) => ({
      ...prevFilter,
      ...updatedFilter,
    }));

    setOpenPopover(null);
  };

  const handleReset = (filterType: string) => {
    let clearedFilter = {};

    switch (filterType) {
      case "model":
        clearedFilter = { models: null };
        if (!Object.values(models).some((modelID) => modelID)) {
          ToastHelper.makeToast(toast, "No model selected", "warning");
          return;
        }
        setModels(unsetModels);
        setCheckedModels(unsetModels);
        setSelectedModels(unsetModels);
        break;
      case "type":
        clearedFilter = { types: null };
        if (!Object.values(types).some((type) => type)) {
          ToastHelper.makeToast(toast, "No type selected", "warning");
          return;
        }
        setTypes(unsetTypes);
        setCheckedTypes(unsetTypes);
        setSelectedTypes(unsetTypes);
        break;
      case "heads":
        clearedFilter = { numHeads: null };
        if (!selectedNumHeads) {
          ToastHelper.makeToast(
            toast,
            "No number of heads selected",
            "warning"
          );
          return;
        }
        setSelectedNumHeads(null);
        break;
      case "dashboards":
        if (props.maxDashboards) break;
        clearedFilter = { numDashboards: null };
        if (!selectedNumDashboards) {
          ToastHelper.makeToast(
            toast,
            "No number of dashboards selected",
            "warning"
          );
          return;
        }
        setNumDashboards([0, props.maxDashboards]);
        setSelectedNumDashboards(null);
        break;
      case "documents":
        clearedFilter = { numDocuments: null };
        if (!selectedNumDocuments) {
          ToastHelper.makeToast(
            toast,
            "No number of documents selected",
            "warning"
          );
          return;
        }
        setNumDocuments([0, props.maxDocuments]);
        setSelectedNumDocuments(null);
        break;
      case "all":
        clearedFilter = {
          models: null,
          types: null,
          numHeads: null,
          numDashboards: null,
          numDocuments: null,
        };
        setModels(unsetModels);
        setCheckedModels(unsetModels);
        setSelectedModels(unsetModels);
        setTypes(unsetTypes);
        setCheckedTypes(unsetTypes);
        setSelectedTypes(unsetTypes);
        setNumHeads([0, props.maxHeads]);
        setSelectedNumHeads(null);
        setNumDashboards([0, props.maxDashboards]);
        setSelectedNumDashboards(null);
        setNumDocuments([0, props.maxDocuments]);
        setSelectedNumDocuments(null);
        break;
      default:
        ToastHelper.makeToast(toast, "Cannot reset filters", "warning");
        return;
    }
    ToastHelper.makeToast(
      toast,
      `${filterType === "all" ? "All filters" : "Filter"} cleared`,
      "success"
    );

    props.setMachineryFilter!((prevFilter) => ({
      ...prevFilter,
      ...clearedFilter,
    }));

    setOpenPopover(null);
  };

  const handlePopover = (popoverId: string | null) => {
    setOpenPopover(popoverId);
    props.onPopoverChange(popoverId);
  };

  const generateCheckboxFilterButton = (
    type: string,
    icon: JSX.Element,
    checkedItems: { [key: string]: boolean },
    setCheckedItems: Function
  ) => {
    return (
      <FilterButton
        label={type.charAt(0).toUpperCase() + type.slice(1)}
        icon={icon}
        content={(onSelect: any) => (
          <CheckboxGroup
            handleChange={onSelect}
            checkedItems={checkedItems}
            setCheckedItems={setCheckedItems}
          />
        )}
        isOpen={openPopover === type}
        onOpen={() => handlePopover(type)}
        onClose={handlePopover}
        handleSave={() => handleSave(type)}
        handleReset={() => handleReset(type)}
        onSelect={(value: string) => handleFilterChange(type, value)}
      />
    );
  };

  const generateCheckboxBadge = (selectedItems: { [key: string]: boolean }) => {
    return Object.entries(selectedItems)
      .filter(([item, isSelected]) => isSelected)
      .map(([item]) => (
        <Badge key={item} colorScheme="purple">
          {item}
        </Badge>
      ));
  };

  const generateSliderFilterButton = (
    type: string,
    defaultValue: [number, number],
    maxSlider: number | undefined
  ) => {
    return (
      <FilterButton
        label={type.charAt(0).toUpperCase() + type.slice(1)}
        icon={<FaHashtag />}
        content={(onSelect: any) => (
          <CustomSlider
            handleChange={onSelect}
            min={0}
            max={maxSlider}
            defaultValue={defaultValue}
            label={type}
          />
        )}
        isOpen={openPopover === type}
        onOpen={() => handlePopover(type)}
        onClose={handlePopover}
        handleSave={() => handleSave(type)}
        handleReset={() => handleReset(type)}
        onSelect={(value: any) => handleFilterChange(type, value)}
      />
    );
  };

  const generateSliderBadge = (
    selectedNum: [number, number] | null,
    type: string
  ) => {
    return (
      selectedNum && (
        <Badge colorScheme="purple">
          {selectedNum[0].toString() === selectedNum[1].toString()
            ? selectedNum[0]
            : `${selectedNum[0]} - ${selectedNum[1]}`}
          &nbsp;{type}
        </Badge>
      )
    );
  };

  return (
    <Box w={"full"} mt={5}>
      {/* FILTER BUTTONS */}
      <Flex gap={10} alignItems={"center"} w={"full"}>
        <Text mr={4} fontWeight={"semibold"}>
          Filter by
        </Text>
        {/* CHECKBOXES */}
        {generateCheckboxFilterButton(
          "model",
          <MdOutlineCategory />,
          checkedModels,
          setCheckedModels
        )}
        {generateCheckboxFilterButton(
          "type",
          <BiCategoryAlt />,
          checkedTypes,
          setCheckedTypes
        )}
        {/* SLIDERS */}
        {generateSliderFilterButton("heads", numHeads, props.maxHeads)}
        {props.callerType === "dashboards" &&
          props.companyID !== 0 &&
          generateSliderFilterButton(
            "dashboards",
            numDashboards,
            props.maxDashboards
          )}
        {props.callerType === "documents" &&
          generateSliderFilterButton(
            "documents",
            numDocuments,
            props.maxDocuments
          )}
        {props.callerType === "both" && (
          <>
            {Number(props.companyID) !== 0 &&
              generateSliderFilterButton(
                "dashboards",
                numDashboards,
                props.maxDashboards
              )}
            {generateSliderFilterButton(
              "documents",
              numDocuments,
              props.maxDocuments
            )}
          </>
        )}
      </Flex>
      {/* BADGES */}
      {(selectedNumHeads ||
        selectedNumDashboards ||
        selectedNumDocuments ||
        Object.values(selectedModels).some((model) => model) ||
        Object.values(selectedTypes).some((type) => type)) && (
          <>
            <Text mt={5} mr={4} fontWeight={"semibold"}>
              Applied filters:
            </Text>
            <Flex gap={4} mt={4}>
              {/* CHECKBOXES */}
              {generateCheckboxBadge(selectedModels)}
              {generateCheckboxBadge(selectedTypes)}
              {/* SLIDERS */}
              {generateSliderBadge(selectedNumHeads, "heads")}
              {props.callerType === "dashboards" &&
                generateSliderBadge(selectedNumDashboards, "dashboards")}
              {props.callerType === "documents" &&
                generateSliderBadge(selectedNumDocuments, "documents")}
              {props.callerType === "both" && (
                <>
                  {generateSliderBadge(selectedNumDashboards, "dashboards")}
                  {generateSliderBadge(selectedNumDocuments, "documents")}
                </>
              )}
              <IconButton
                aria-label="clear filters"
                size={"6px"}
                onClick={() => handleReset("all")}
                icon={<FaRegTrashCan />}
              />
            </Flex>
          </>
        )}
    </Box>
  );
}
