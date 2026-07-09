import { Citizen, ICitizen } from "./citizen.model.js";

export class CitizenService {
  /**
   * Find a citizen by email, mobile phone, or alternative mobile number.
   */
  static async getCitizen(identifier: string) {
    const query = {
      $or: [
        { email: identifier.toLowerCase() },
        { mobile: identifier },
        { alternateMobile: identifier },
      ],
    };

    return await Citizen.findOne(query);
  }

  /**
   * Find a citizen by identifiers, or create a new one if not found.
   */
  static async getOrCreateCitizen(
    identifier: string,
    createData: Partial<ICitizen>
  ) {
    let citizen = await this.getCitizen(identifier);

    if (!citizen) {
      if (!createData.mobile) {
        throw new Error(
          "Missing required field to create a citizen: mobile"
        );
      }
      citizen = await Citizen.create(createData);
    }

    return citizen;
  }
}
