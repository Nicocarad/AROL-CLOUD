export default class Sensor {
    name: string
    description: string
    unit: string
    thresholdLow: number | null
    thresholdHigh: number | null
    internalName: string
    category: string
    type: string
    bucketingType: string
    imgFilename: string
    imgPointerLocation: { x: string, y: string }
    machineryUID?: string
    isHeadMounted?: boolean

    constructor(name: string, description: string, unit: string, thresholdLow: number, thresholdHigh: number, internalName: string, category: string, type: string, bucketingType: string, imgFilename: string, imgPointerLocation: { x: string; y: string }, machineryUID?: string, isHeadMounted?: boolean) {
        this.name = name;
        this.description = description;
        this.unit = unit;
        this.thresholdLow = thresholdLow;
        this.thresholdHigh = thresholdHigh;
        this.internalName = internalName;
        this.category = category;
        this.type = type;
        this.bucketingType = bucketingType;
        this.imgFilename = imgFilename;
        this.imgPointerLocation = imgPointerLocation;
        this.machineryUID = machineryUID;
        this.isHeadMounted = isHeadMounted;
    }
}