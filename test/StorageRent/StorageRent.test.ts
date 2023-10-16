import { calculateMonthlyRent } from "../../src/StorageRent/StorageRent";

describe("calculateMonthlyRent function", () => {
  
    it("should return MonthlyRentRecords", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 100.00,
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00, 
                rentDueDate: new Date("2023-02-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-03-01T00:00:00")
            }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should return MonthlyRentRecords validate first payment due date and first month pro-rate when lease start is before monthly due date", () => {

        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-01-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 15;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;
    
        const result = calculateMonthlyRent(baseMonthlyRent,
            leaseStartDate, windowStartDate, windowEndDate, 
            dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);
    
        let expectedResult = [
            {
                vacancy: false,
                rentAmount: 46.67,
                rentDueDate: new Date("2023-01-01T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 100,
                rentDueDate: new Date("2023-01-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 110.00, 
                rentDueDate: new Date("2023-02-15T00:00:00")
            },
            {
                vacancy: false,
                rentAmount: 121.00,
                rentDueDate: new Date("2023-03-15T00:00:00")
            }
        ];
    
        expect(result).toEqual(expectedResult);
      });
    });

    it("should handle vacancy before lease starts", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-02-01T00:00:00");
        const windowStartDate = new Date("2023-01-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent, leaseStartDate, windowStartDate, windowEndDate, dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        const expectedResult = [
            { vacancy: true, rentAmount: 0, rentDueDate: new Date("2023-01-01T00:00:00") },
            { vacancy: false, rentAmount: 100.00, rentDueDate: new Date("2023-02-01T00:00:00") },
            { vacancy: false, rentAmount: 110.00, rentDueDate: new Date("2023-03-01T00:00:00") }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should handle leap year scenario", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-12-28T00:00:00"); 
        const windowStartDate = new Date("2023-12-01T00:00:00");
        const windowEndDate = new Date("2024-03-31T00:00:00");
        const dayOfMonthRentDue = 29;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;
    
        const result = calculateMonthlyRent(baseMonthlyRent, leaseStartDate, windowStartDate, windowEndDate, dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);
    
        const expectedResult = [
            { vacancy: true, rentAmount: 0, rentDueDate: new Date("2023-12-29T00:00:00") },
            { vacancy: false, rentAmount: 110.00, rentDueDate: new Date("2024-01-29T00:00:00") },
            { vacancy: false, rentAmount: 121.00, rentDueDate: new Date("2024-02-29T00:00:00") },
            { vacancy: false, rentAmount: 133.10, rentDueDate: new Date("2024-03-29T00:00:00") }
        ];
    
        expect(result).toEqual(expectedResult);
    });
    
    it("should handle when day of month rent due is greater than the number of days in the month", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2023-02-01T00:00:00");
        const windowStartDate = new Date("2023-02-01T00:00:00");
        const windowEndDate = new Date("2023-03-31T00:00:00");
        const dayOfMonthRentDue = 31;
        const rentRateChangeFrequency = 1;
        const rentChangeRate = .1;

        const result = calculateMonthlyRent(baseMonthlyRent, leaseStartDate, windowStartDate, windowEndDate, dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        const expectedResult = [
            { vacancy: false, rentAmount: 100.00, rentDueDate: new Date("2023-02-28T00:00:00") }, // February has only 28 days in 2023
            { vacancy: false, rentAmount: 110.00, rentDueDate: new Date("2023-03-31T00:00:00") }
        ];

        expect(result).toEqual(expectedResult);
    });    

    it("should handle rent increase for rented units", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2024-01-01T00:00:00");
        const windowStartDate = new Date("2024-01-01T00:00:00");
        const windowEndDate = new Date("2024-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;  
        const rentChangeRate = 0.10;

        const result = calculateMonthlyRent(baseMonthlyRent, leaseStartDate, windowStartDate, windowEndDate, dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        const januaryRent = baseMonthlyRent;
        const februaryRent = januaryRent + (januaryRent * rentChangeRate);  
        const marchRent = februaryRent + (februaryRent * rentChangeRate);

        const expectedResult = [
            { vacancy: false, rentAmount: parseFloat(januaryRent.toFixed(2)), rentDueDate: new Date("2024-01-01T00:00:00") },
            { vacancy: false, rentAmount: parseFloat(februaryRent.toFixed(2)), rentDueDate: new Date("2024-02-01T00:00:00") },
            { vacancy: false, rentAmount: parseFloat(marchRent.toFixed(2)), rentDueDate: new Date("2024-03-01T00:00:00") }
        ];

        expect(result).toEqual(expectedResult);
    });

    it("should handle rent decrease for rented units", () => {
        const baseMonthlyRent = 100.00;
        const leaseStartDate = new Date("2024-01-01T00:00:00");
        const windowStartDate = new Date("2024-01-01T00:00:00");
        const windowEndDate = new Date("2024-03-31T00:00:00");
        const dayOfMonthRentDue = 1;
        const rentRateChangeFrequency = 1;  
        const rentChangeRate = -0.10;

        const result = calculateMonthlyRent(baseMonthlyRent, leaseStartDate, windowStartDate, windowEndDate, dayOfMonthRentDue, rentRateChangeFrequency, rentChangeRate);

        const januaryRent = baseMonthlyRent;
        const februaryRent = januaryRent + (januaryRent * rentChangeRate);  
        const marchRent = februaryRent + (februaryRent * rentChangeRate);

        const expectedResult = [
            { vacancy: false, rentAmount: parseFloat(januaryRent.toFixed(2)), rentDueDate: new Date("2024-01-01T00:00:00") },
            { vacancy: false, rentAmount: parseFloat(februaryRent.toFixed(2)), rentDueDate: new Date("2024-02-01T00:00:00") },
            { vacancy: false, rentAmount: parseFloat(marchRent.toFixed(2)), rentDueDate: new Date("2024-03-01T00:00:00") }
        ];

        expect(result).toEqual(expectedResult);
    });