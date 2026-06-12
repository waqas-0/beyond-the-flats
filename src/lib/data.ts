export type Trip = {
  date: string;
  title: string;
  duration: string;
  location: string;
  catch: string;
  /** Path to the trip photo under /public. */
  photo: string;
};

export type Review = {
  name: string;
  date: string;
  stars: number;
  text: string;
};

export type Guide = {
  name: string;
  verified: boolean;
  specialty: string;
  experience: string;
  location: string;
  bio: string;
  stats: { tripsLogged: string; fishReleased: string; rating: string; satisfaction: string };
  recentTrips: Trip[];
  reviewScore: number;
  reviews: Review[];
};

/** The signed-in guide (Robert Simon) — dashboard, profile, account. */
export const guideUser = {
  name: "Robert Simon",
  email: "robertsimon@gmail.com",
  verified: true,
  avatar: "/photos/guide-avatar.png",
  stats: { trips: "142", fish: "856", rating: "4.98" },
  upcoming: [
    {
      month: "OCT",
      day: "14",
      title: "Full Day Tarpon Search",
      client: "Client: Robert J. • 2 Anglers",
    },
    {
      month: "OCT",
      day: "15",
      title: "Half Day Bonefish",
      client: "Client: Sarah L. • 1 Angler",
    },
  ],
};

/** Logged trips shown on the Trip History screen. */
export const tripHistory = [
  {
    date: "APR 23, 2026",
    title: "Deep Creek Flats",
    duration: "6h 15m",
    location: "Andros, Bahamas",
    catch: "4 Bonefish, 1 Tarpon",
    photo: "/photos/trip-deep-creek.png",
  },
  {
    date: "APR 21, 2026",
    title: "Marathon Key Reef",
    duration: "8h 45m",
    location: "Florida Keys, FL",
    catch: "12 Snapper, 2 Grouper",
    photo: "/photos/trip-marathon-key.png",
  },
  {
    date: "APR 21, 2026",
    title: "Mangrove Point",
    duration: "4h 30m",
    location: "Exuma Sound",
    catch: "8 Bonefish",
    photo: "/photos/trip-mangrove.png",
  },
];

export const guide: Guide = {
  name: "Capt. Elias Vance",
  verified: true,
  specialty: "Bonefish, Tarpon & Permit Specialist",
  experience: "15 Years Exp.",
  location: "Abaco, Bahamas",
  bio: "Specializing in the technical sight-fishing of the Abaco flats. We chase the 'Silver Ghost' with precision and deep respect for the ecosystem.",
  stats: {
    tripsLogged: "500+",
    fishReleased: "1,240+",
    rating: "4.8",
    satisfaction: "98%",
  },
  recentTrips: [
    {
      date: "APR 23, 2026",
      title: "Deep Creek Flats",
      duration: "6h 15m",
      location: "Andros, Bahamas",
      catch: "4 Bonefish, 1 Tarpon",
      photo: "/photos/trip-deep-creek.png",
    },
    {
      date: "APR 19, 2026",
      title: "Marathon Key Reef",
      duration: "5h 00m",
      location: "Abaco, Bahamas",
      catch: "2 Permit, 3 Bonefish",
      photo: "/photos/trip-permit.png",
    },
    {
      date: "APR 11, 2026",
      title: "Mangrove Point",
      duration: "4h 30m",
      location: "Abaco, Bahamas",
      catch: "6 Bonefish",
      photo: "/photos/trip-mangrove.png",
    },
  ],
  reviewScore: 4.9,
  reviews: [
    {
      name: "Admiral J. Thorne",
      date: "OCT 2025",
      stars: 5,
      text: "Elias is a world-class professional. His ability to spot fish that are virtually invisible to the naked eye is uncanny. A masterclass in stealth and technical fly fishing.",
    },
    {
      name: "Sarah M.",
      date: "SEP 2025",
      stars: 5,
      text: "Best guide in Abaco, hands down. Patient, knowledgeable, and genuinely cares about the fish. We landed four big bonefish on our first morning.",
    },
  ],
};
