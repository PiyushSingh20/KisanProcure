import { PrismaClient, Role, UserStatus, CenterStatus, Crop, BookingStatus, TokenStatus, ProcurementState, QualityCheckStatus, PaymentStatus, ComplaintStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  await cleanDatabase();

  console.log('👤 Creating admin user...');
  const adminPassword = await bcrypt.hash('admin123', 12);
  const adminUser = await prisma.user.create({
    data: {
      mobileNumber: '9999999999',
      email: 'admin@kisanprocure.gov.in',
      passwordHash: adminPassword,
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      admin: {
        create: {
          permissions: ['ALL'],
        },
      },
    },
  });
  console.log('✅ Admin created:', adminUser.mobileNumber);

  console.log('🌾 Creating crops...');
  const crops = await Promise.all([
    prisma.crop.create({
      data: {
        code: 'WHEAT',
        name: 'Wheat',
        scientificName: 'Triticum aestivum',
        category: 'CEREAL',
        unit: 'QUINTAL',
        minPrice: 2125,
        maxPrice: 2200,
        seasonStart: 10,
        seasonEnd: 3,
      },
    }),
    prisma.crop.create({
      data: {
        code: 'RICE',
        name: 'Rice (Paddy)',
        scientificName: 'Oryza sativa',
        category: 'CEREAL',
        unit: 'QUINTAL',
        minPrice: 2040,
        maxPrice: 2100,
        seasonStart: 10,
        seasonEnd: 1,
      },
    }),
    prisma.crop.create({
      data: {
        code: 'MAIZE',
        name: 'Maize',
        scientificName: 'Zea mays',
        category: 'CEREAL',
        unit: 'QUINTAL',
        minPrice: 1870,
        maxPrice: 1950,
        seasonStart: 10,
        seasonEnd: 1,
      },
    }),
    prisma.crop.create({
      data: {
        code: 'BARLEY',
        name: 'Barley',
        scientificName: 'Hordeum vulgare',
        category: 'CEREAL',
        unit: 'QUINTAL',
        minPrice: 1600,
        maxPrice: 1700,
        seasonStart: 10,
        seasonEnd: 3,
      },
    }),
    prisma.crop.create({
      data: {
        code: 'GRAM',
        name: 'Gram (Chana)',
        scientificName: 'Cicer arietinum',
        category: 'PULSE',
        unit: 'QUINTAL',
        minPrice: 5100,
        maxPrice: 5300,
        seasonStart: 10,
        seasonEnd: 3,
      },
    }),
    prisma.crop.create({
      data: {
        code: 'MUSTARD',
        name: 'Mustard',
        scientificName: 'Brassica juncea',
        category: 'OILSEED',
        unit: 'QUINTAL',
        minPrice: 5050,
        maxPrice: 5200,
        seasonStart: 10,
        seasonEnd: 3,
      },
    }),
    prisma.crop.create({
      data: {
        code: 'SOYBEAN',
        name: 'Soybean',
        scientificName: 'Glycine max',
        category: 'OILSEED',
        unit: 'QUINTAL',
        minPrice: 4300,
        maxPrice: 4500,
        seasonStart: 10,
        seasonEnd: 1,
      },
    }),
    prisma.crop.create({
      data: {
        code: 'COTTON',
        name: 'Cotton',
        scientificName: 'Gossypium hirsutum',
        category: 'FIBER',
        unit: 'QUINTAL',
        minPrice: 6080,
        maxPrice: 6200,
        seasonStart: 10,
        seasonEnd: 1,
      },
    }),
  ]);
  console.log('✅ Crops created:', crops.length);

  console.log('🏢 Creating procurement centers...');
  const centers = await Promise.all([
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-DEL-001',
        name: 'Kisan Procurement Center - Delhi North',
        address: 'NH-1, Near Singhu Border',
        village: 'Singhu',
        district: 'North Delhi',
        state: 'Delhi',
        pincode: '110040',
        latitude: 28.8328,
        longitude: 77.0985,
        contactNumber: '011-27781234',
        email: 'delhi-north@kisanprocure.gov.in',
        capacityPerDay: 200,
        operatingHours: { start: '09:00', end: '17:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Cold Storage', 'Farmer Rest Area', 'Parking'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.slice(0, 5).map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
            { counterNumber: 3, isActive: true },
          ],
        },
      },
    }),
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-DEL-002',
        name: 'Kisan Procurement Center - Delhi South',
        address: 'Mehrauli-Gurgaon Road, Near Chattarpur',
        village: 'Chattarpur',
        district: 'South Delhi',
        state: 'Delhi',
        pincode: '110074',
        latitude: 28.5079,
        longitude: 77.1874,
        contactNumber: '011-26654321',
        email: 'delhi-south@kisanprocure.gov.in',
        capacityPerDay: 150,
        operatingHours: { start: '09:00', end: '17:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Farmer Rest Area', 'Parking'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.slice(0, 6).map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
          ],
        },
      },
    }),
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-HRY-001',
        name: 'Kisan Procurement Center - Karnal',
        address: 'GT Road, Near Karnal Bypass',
        village: 'Karnal',
        district: 'Karnal',
        state: 'Haryana',
        pincode: '132001',
        latitude: 29.6857,
        longitude: 76.9905,
        contactNumber: '0184-2278901',
        email: 'karnal@kisanprocure.gov.in',
        capacityPerDay: 300,
        operatingHours: { start: '08:00', end: '18:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Cold Storage', 'Drying Yard', 'Farmer Rest Area', 'Parking', 'Canteen'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
            { counterNumber: 3, isActive: true },
            { counterNumber: 4, isActive: true },
            { counterNumber: 5, isActive: true },
          ],
        },
      },
    }),
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-HRY-002',
        name: 'Kisan Procurement Center - Kurukshetra',
        address: 'Pehowa Road, Near University',
        village: 'Kurukshetra',
        district: 'Kurukshetra',
        state: 'Haryana',
        pincode: '136118',
        latitude: 29.9695,
        longitude: 76.8783,
        contactNumber: '01744-238901',
        email: 'kurukshetra@kisanprocure.gov.in',
        capacityPerDay: 250,
        operatingHours: { start: '08:00', end: '18:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Cold Storage', 'Farmer Rest Area', 'Parking'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.slice(0, 6).map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
            { counterNumber: 3, isActive: true },
          ],
        },
      },
    }),
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-PUN-001',
        name: 'Kisan Procurement Center - Ludhiana',
        address: 'Ferozepur Road, Near PAU',
        village: 'Ludhiana',
        district: 'Ludhiana',
        state: 'Punjab',
        pincode: '141004',
        latitude: 30.9010,
        longitude: 75.8573,
        contactNumber: '0161-2456789',
        email: 'ludhiana@kisanprocure.gov.in',
        capacityPerDay: 350,
        operatingHours: { start: '08:00', end: '18:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Cold Storage', 'Drying Yard', 'Farmer Rest Area', 'Parking', 'Canteen', 'Medical Aid'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
            { counterNumber: 3, isActive: true },
            { counterNumber: 4, isActive: true },
            { counterNumber: 5, isActive: true },
            { counterNumber: 6, isActive: true },
          ],
        },
      },
    }),
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-PUN-002',
        name: 'Kisan Procurement Center - Patiala',
        address: 'Rajpura Road, Near ITI',
        village: 'Patiala',
        district: 'Patiala',
        state: 'Punjab',
        pincode: '147001',
        latitude: 30.3398,
        longitude: 76.3869,
        contactNumber: '0175-2367890',
        email: 'patiala@kisanprocure.gov.in',
        capacityPerDay: 200,
        operatingHours: { start: '08:00', end: '17:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Farmer Rest Area', 'Parking'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.slice(0, 5).map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
            { counterNumber: 3, isActive: true },
          ],
        },
      },
    }),
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-UP-001',
        name: 'Kisan Procurement Center - Meerut',
        address: 'Delhi Road, Near Bypass',
        village: 'Meerut',
        district: 'Meerut',
        state: 'Uttar Pradesh',
        pincode: '250002',
        latitude: 28.9845,
        longitude: 77.7064,
        contactNumber: '0121-2765432',
        email: 'meerut@kisanprocure.gov.in',
        capacityPerDay: 180,
        operatingHours: { start: '09:00', end: '17:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Farmer Rest Area', 'Parking'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.slice(0, 4).map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
          ],
        },
      },
    }),
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-UP-002',
        name: 'Kisan Procurement Center - Saharanpur',
        address: 'Ambala Road, Near ITI',
        village: 'Saharanpur',
        district: 'Saharanpur',
        state: 'Uttar Pradesh',
        pincode: '247001',
        latitude: 29.9680,
        longitude: 77.5552,
        contactNumber: '0132-2765432',
        email: 'saharanpur@kisanprocure.gov.in',
        capacityPerDay: 150,
        operatingHours: { start: '09:00', end: '17:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Farmer Rest Area', 'Parking'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.slice(0, 4).map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
          ],
        },
      },
    }),
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-RAJ-001',
        name: 'Kisan Procurement Center - Sri Ganganagar',
        address: 'Hanumangarh Road, Near Mandi',
        village: 'Sri Ganganagar',
        district: 'Sri Ganganagar',
        state: 'Rajasthan',
        pincode: '335001',
        latitude: 29.9038,
        longitude: 73.8772,
        contactNumber: '0154-2478901',
        email: 'ganganagar@kisanprocure.gov.in',
        capacityPerDay: 220,
        operatingHours: { start: '08:00', end: '17:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Cold Storage', 'Farmer Rest Area', 'Parking'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.slice(0, 6).map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
            { counterNumber: 3, isActive: true },
          ],
        },
      },
    }),
    prisma.procurementCenter.create({
      data: {
        code: 'KSN-MP-001',
        name: 'Kisan Procurement Center - Indore',
        address: 'AB Road, Near Rau',
        village: 'Indore',
        district: 'Indore',
        state: 'Madhya Pradesh',
        pincode: '452012',
        latitude: 22.7196,
        longitude: 75.8577,
        contactNumber: '0731-2789012',
        email: 'indore@kisanprocure.gov.in',
        capacityPerDay: 200,
        operatingHours: { start: '09:00', end: '17:00', lunch: '13:00-14:00' },
        facilities: ['Weighbridge', 'Quality Lab', 'Farmer Rest Area', 'Parking'],
        status: CenterStatus.ACTIVE,
        crops: { connect: crops.slice(0, 5).map(c => ({ id: c.id })) },
        counters: {
          create: [
            { counterNumber: 1, isActive: true },
            { counterNumber: 2, isActive: true },
            { counterNumber: 3, isActive: true },
          ],
        },
      },
    }),
  ]);
  console.log('✅ Centers created:', centers.length);

  console.log('👮 Creating officers...');
  const officers = await Promise.all(
    centers.map(async (center, index) => {
      const officerPassword = await bcrypt.hash('officer123', 12);
      const officerUser = await prisma.user.create({
        data: {
          mobileNumber: `88888888${String(index + 1).padStart(2, '0')}`,
          email: `officer${index + 1}@kisanprocure.gov.in`,
          passwordHash: officerPassword,
          firstName: `Officer`,
          lastName: `${center.district}`,
          role: Role.OFFICER,
          status: UserStatus.ACTIVE,
          officer: {
            create: {
              employeeId: `EMP${String(index + 1).padStart(4, '0')}`,
              centerId: center.id,
              designation: 'Procurement Officer',
              permissions: ['MANAGE_QUEUE', 'QUALITY_CHECK', 'WEIGHMENT', 'PAYMENT_PROCESSING'],
            },
          },
        },
      });
      return officerUser;
    })
  );
  console.log('✅ Officers created:', officers.length);

  console.log('👨‍🌾 Creating farmers...');
  const farmers = [];
  const states = ['Delhi', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Rajasthan', 'Madhya Pradesh'];
  const districts = {
    'Delhi': ['North Delhi', 'South Delhi', 'East Delhi', 'West Delhi'],
    'Haryana': ['Karnal', 'Kurukshetra', 'Panipat', 'Sonipat', 'Ambala'],
    'Punjab': ['Ludhiana', 'Patiala', 'Jalandhar', 'Amritsar', 'Bathinda'],
    'Uttar Pradesh': ['Meerut', 'Saharanpur', 'Muzaffarnagar', 'Baghpat', 'Ghaziabad'],
    'Rajasthan': ['Sri Ganganagar', 'Hanumangarh', 'Bikaner', 'Jodhpur'],
    'Madhya Pradesh': ['Indore', 'Ujjain', 'Dewas', 'Khargone'],
  };

  for (let i = 0; i < 100; i++) {
    const state = states[i % states.length];
    const district = districts[state][i % districts[state].length];
    const farmerPassword = await bcrypt.hash('farmer123', 12);

    const farmerUser = await prisma.user.create({
      data: {
        mobileNumber: `7${String(700000000 + i).slice(1)}`,
        email: `farmer${i + 1}@example.com`,
        passwordHash: farmerPassword,
        firstName: `Farmer`,
        lastName: `${i + 1}`,
        role: Role.FARMER,
        status: UserStatus.ACTIVE,
        farmer: {
          create: {
            farmerCode: `KSN-${String(i + 1).padStart(6, '0')}`,
            aadhaarNumber: `${String(200000000000 + i).slice(1)}`,
            panNumber: `ABCDE${String(1000 + i).slice(1)}F`,
            bankAccount: `${String(1000000000 + i).slice(1)}`,
            ifscCode: 'SBIN0001234',
            address: `Village ${district}, Tehsil ${district}`,
            village: district,
            district: district,
            state: state,
            pincode: '110001',
            latitude: 28.6139 + (Math.random() - 0.5) * 2,
            longitude: 77.2090 + (Math.random() - 0.5) * 2,
            totalLandArea: Math.round((Math.random() * 10 + 1) * 10) / 10,
          },
        },
      },
    });
    farmers.push(farmerUser);
  }
  console.log('✅ Farmers created:', farmers.length);

  console.log('🌱 Creating farmer produce...');
  for (const farmerUser of farmers.slice(0, 80)) {
    const farmer = await prisma.farmer.findUnique({ where: { userId: farmerUser.id } });
    if (!farmer) continue;

    const numCrops = Math.floor(Math.random() * 3) + 1;
    const selectedCrops = crops.sort(() => 0.5 - Math.random()).slice(0, numCrops);

    for (const crop of selectedCrops) {
      await prisma.farmerProduce.create({
        data: {
          farmerId: farmer.id,
          cropId: crop.id,
          quantity: Math.round((Math.random() * 50 + 5) * 10) / 10,
          expectedPrice: crop.minPrice + Math.random() * (crop.maxPrice - crop.minPrice),
          harvestDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          qualityGrade: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        },
      });
    }
  }
  console.log('✅ Farmer produce created');

  console.log('📅 Creating schedules and slots...');
  const today = new Date();
  for (let dayOffset = 0; dayOffset < 14; dayOffset++) {
    const scheduleDate = new Date(today);
    scheduleDate.setDate(scheduleDate.getDate() + dayOffset);

    for (const center of centers) {
      const centerCrops = await prisma.procurementCenter.findUnique({
        where: { id: center.id },
        include: { crops: true },
      });

      for (const crop of centerCrops!.crops.slice(0, 3)) {
        const schedule = await prisma.schedule.create({
          data: {
            centerId: center.id,
            cropId: crop.id,
            date: scheduleDate,
            startTime: '09:00',
            endTime: '17:00',
            maxTokens: center.capacityPerDay,
            isActive: true,
          },
        });

        const timeSlots = [
          { start: '09:00', end: '11:00' },
          { start: '11:00', end: '13:00' },
          { start: '14:00', end: '16:00' },
          { start: '16:00', end: '17:00' },
        ];

        for (const slot of timeSlots) {
          await prisma.slot.create({
            data: {
              scheduleId: schedule.id,
              cropId: crop.id,
              startTime: slot.start,
              endTime: slot.end,
              capacity: Math.floor(center.capacityPerDay / 4),
              isActive: true,
            },
          });
        }
      }
    }
  }
  console.log('✅ Schedules and slots created');

  console.log('📋 Creating sample bookings and tokens...');
  for (let i = 0; i < 50; i++) {
    const farmerUser = farmers[Math.floor(Math.random() * farmers.length)];
    const farmer = await prisma.farmer.findUnique({ where: { userId: farmerUser.id } });
    if (!farmer) continue;

    const center = centers[Math.floor(Math.random() * centers.length)];
    const centerWithCrops = await prisma.procurementCenter.findUnique({
      where: { id: center.id },
      include: { crops: true },
    });
    if (!centerWithCrops?.crops.length) continue;

    const crop = centerWithCrops.crops[Math.floor(Math.random() * centerWithCrops.crops.length)];
    const schedule = await prisma.schedule.findFirst({
      where: { centerId: center.id, cropId: crop.id, date: { gte: today }, isActive: true },
      include: { slots: { where: { isActive: true } } },
    });
    if (!schedule?.slots.length) continue;

    const slot = schedule.slots[Math.floor(Math.random() * schedule.slots.length)];
    const produce = await prisma.farmerProduce.findUnique({
      where: { farmerId_cropId: { farmerId: farmer.id, cropId: crop.id } },
    });
    if (!produce || produce.quantity < 5) continue;

    const booking = await prisma.booking.create({
      data: {
        bookingNumber: `BK${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
        farmerId: farmer.id,
        centerId: center.id,
        cropId: crop.id,
        slotId: slot.id,
        scheduledDate: schedule.date,
        status: BookingStatus.CONFIRMED,
        quantity: Math.min(produce.quantity, Math.round(Math.random() * 20 + 5)),
        expectedPrice: crop.minPrice + Math.random() * (crop.maxPrice - crop.minPrice),
      },
    });

    await prisma.slot.update({
      where: { id: slot.id },
      data: { bookedCount: { increment: 1 } },
    });

    await prisma.farmerProduce.update({
      where: { id: produce.id },
      data: { quantity: { decrement: booking.quantity } },
    });

    const tokenNumber = `KSN-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`;
    const token = await prisma.token.create({
      data: {
        tokenNumber,
        bookingId: booking.id,
        farmerId: farmer.id,
        centerId: center.id,
        cropId: crop.id,
        status: [TokenStatus.GENERATED, TokenStatus.WAITING, TokenStatus.CALLED, TokenStatus.ARRIVED][Math.floor(Math.random() * 4)],
      },
    });

    await prisma.booking.update({
      where: { id: booking.id },
      data: { tokenId: token.id },
    });

    if (token.status !== TokenStatus.GENERATED) {
      const position = Math.floor(Math.random() * 20) + 1;
      await prisma.queueEntry.create({
        data: {
          tokenId: token.id,
          centerId: center.id,
          position,
        },
      });
      await prisma.token.update({
        where: { id: token.id },
        data: { queuePosition: position },
      });
    }

    if (token.status === TokenStatus.ARRIVED || token.status === TokenStatus.CALLED) {
      await prisma.procurementRecord.create({
        data: {
          recordNumber: `PRC-${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}-${String(i + 1).padStart(4, '0')}`,
          tokenId: token.id,
          farmerId: farmer.id,
          centerId: center.id,
          cropId: crop.id,
          state: token.status === TokenStatus.CALLED ? ProcurementState.CALLED : ProcurementState.ARRIVED,
          quantity: booking.quantity,
        },
      });
    }
  }
  console.log('✅ Sample bookings and tokens created');

  console.log('📝 Creating sample complaints...');
  for (let i = 0; i < 20; i++) {
    const farmerUser = farmers[Math.floor(Math.random() * farmers.length)];
    const farmer = await prisma.farmer.findUnique({ where: { userId: farmerUser.id } });
    if (!farmer) continue;

    const center = centers[Math.floor(Math.random() * centers.length)];
    const statuses = [ComplaintStatus.OPEN, ComplaintStatus.IN_PROGRESS, ComplaintStatus.RESOLVED, ComplaintStatus.CLOSED];

    await prisma.complaint.create({
      data: {
        complaintNumber: `CMP${today.getFullYear()}${(today.getMonth() + 1).toString().padStart(2, '0')}${today.getDate().toString().padStart(2, '0')}${String(i + 1).padStart(4, '0')}`,
        farmerId: farmer.id,
        centerId: center.id,
        subject: ['Long wait time', 'Poor quality check', 'Payment delay', 'Center facilities', 'Staff behavior'][Math.floor(Math.random() * 5)],
        description: 'Detailed description of the complaint...',
        status: statuses[Math.floor(Math.random() * statuses.length)],
        priority: Math.floor(Math.random() * 3) + 1,
      },
    });
  }
  console.log('✅ Sample complaints created');

  console.log('📊 Creating center analytics...');
  for (let dayOffset = -30; dayOffset <= 0; dayOffset++) {
    const analyticsDate = new Date(today);
    analyticsDate.setDate(analyticsDate.getDate() + dayOffset);

    for (const center of centers) {
      const bookingsCount = Math.floor(Math.random() * center.capacityPerDay * 0.8);
      const tokensCount = Math.floor(bookingsCount * 0.9);
      const completedCount = Math.floor(tokensCount * 0.85);
      const noShows = tokensCount - completedCount;

      await prisma.centerAnalytics.upsert({
        where: { centerId_date: { centerId: center.id, date: analyticsDate } },
        create: {
          centerId: center.id,
          date: analyticsDate,
          totalBookings: bookingsCount,
          totalFarmers: tokensCount,
          totalTokens: tokensCount,
          totalProcured: completedCount * 10,
          avgWaitTime: 20 + Math.random() * 30,
          avgProcessTime: 8 + Math.random() * 7,
          noShowCount: noShows,
          peakHour: 10 + Math.floor(Math.random() * 4),
          utilization: (bookingsCount / center.capacityPerDay) * 100,
        },
        update: {},
      });
    }
  }
  console.log('✅ Center analytics created');

  console.log('🔔 Creating sample notifications...');
  for (const farmerUser of farmers.slice(0, 20)) {
    const farmer = await prisma.farmer.findUnique({ where: { userId: farmerUser.id } });
    if (!farmer) continue;

    await prisma.notification.create({
      data: {
        userId: farmer.userId,
        type: 'SLOT_BOOKED',
        channel: 'IN_APP',
        title: 'Welcome to KisanProcure!',
        message: 'Your account has been created successfully. Start by adding your crop produce and booking a slot.',
        isRead: false,
      },
    });
  }
  console.log('✅ Sample notifications created');

  console.log('📢 Creating announcements...');
  await prisma.announcement.createMany({
    data: [
      {
        title: 'New Procurement Centers Added',
        message: 'We have added 3 new procurement centers in Punjab and Haryana. Check the centers list for details.',
        priority: 1,
        targetRoles: [Role.FARMER],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'Minimum Support Prices Updated for 2024-25',
        message: 'The government has announced new MSP for Rabi crops. Wheat: ₹2125/quintal, Mustard: ₹5050/quintal.',
        priority: 2,
        targetRoles: [Role.FARMER, Role.OFFICER],
        startDate: new Date(),
        endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      },
      {
        title: 'System Maintenance Scheduled',
        message: 'Scheduled maintenance on Sunday 2:00 AM - 4:00 AM. Services may be temporarily unavailable.',
        priority: 1,
        targetRoles: [Role.FARMER, Role.OFFICER, Role.ADMIN],
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    ],
  });
  console.log('✅ Announcements created');

  console.log('🎉 Seed completed successfully!');
}

async function cleanDatabase() {
  console.log('🧹 Cleaning database...');
  const models = [
    'notification', 'announcement', 'complaint', 'payment', 'receipt',
    'weighment', 'qualityCheck', 'procurementRecord', 'queueEntry',
    'token', 'booking', 'slot', 'schedule', 'farmerProduce',
    'farmer', 'officer', 'admin', 'centerCounter', 'procurementCenter',
    'crop', 'auditLog', 'agentTask', 'agentPrediction', 'agentRecommendation',
    'forecastResult', 'session', 'user',
  ];

  for (const model of models) {
    if (typeof (prisma as any)[model]?.deleteMany === 'function') {
      await (prisma as any)[model].deleteMany();
    }
  }
  console.log('✅ Database cleaned');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });