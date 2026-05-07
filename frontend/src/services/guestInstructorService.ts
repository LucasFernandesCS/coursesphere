import type { GuestInstructor } from "../types/guestInstructor";

type RandomUserResponse = {
  results: {
    name: {
      first: string;
      last: string;
    };
    email: string;
    picture: {
      large: string;
    };
    location: {
      country: string;
    };
  }[];
};

export async function getGuestInstructor(): Promise<GuestInstructor> {
  const response = await fetch("https://randomuser.me/api/");

  if (!response.ok) {
    throw new Error("Failed to fetch guest instructor");
  }

  const data: RandomUserResponse = await response.json();
  const instructor = data.results[0];

  return {
    name: `${instructor.name.first} ${instructor.name.last}`,
    email: instructor.email,
    picture: instructor.picture.large,
    country: instructor.location.country,
  };
}
