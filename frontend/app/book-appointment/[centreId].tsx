import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { PageHeader } from "@/components/PageHeader";
import ThemedView from "@/components/ThemedView";
import { color } from "@/constant/color";
import { useNotification } from "@/context/NotificationContext";
import { Formik } from "formik";
import * as Yup from "yup";
import FormField from "@/components/FormField";
import { PrimaryButton } from "@/components/PrimaryButton";
import { TabBarIcon } from "@/components/TabBarIcon";
import { getCentreDetails, createAppointment } from "@/services/user.service";
import { analyticsService } from "@/services/analyticsService";
import { LoadingOverlay } from "@/components/LoadingOverlay";

import { useTranslation } from "react-i18next";

const BookingSchema = Yup.object().shape({
  date: Yup.string().required("La date est requise"),
  time: Yup.string().required("L'heure est requise"),
});

export default function BookAppointmentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { show } = useNotification();
  const params = useLocalSearchParams();
  const centreId = Number(params.centreId);

  const [centre, setCentre] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadCentre = async () => {
      if (!centreId) return;
      setLoading(true);
      try {
        // This will be replaced with a real service call
        const res = await getCentreDetails(centreId);
        if (res.success) {
          setCentre(res.centre);
        } else {
          show("error", t("booking.loadError"));
        }
      } catch (error) {
        show("error", t("booking.loadError"));
      } finally {
        setLoading(false);
      }
    };
    loadCentre();
  }, [centreId]);

  const handleBooking = async (values: { date: string; time: string }) => {
    setIsSubmitting(true);
    try {
      const appointmentData = {
        id_centre: centreId,
        date_rdv: values.date,
        heure_debut: values.time,
        // In a real app, you'd add more fields like donation type
      };
      const res = await createAppointment(appointmentData);
      if (res.success) {
        analyticsService.trackEvent(analyticsService.events.APPOINTMENT_BOOKED, {
          centreId: centreId,
          centreName: centre.nom_centre,
        });
        show("success", t("booking.success"));
        router.replace("/rendezvous");
      } else {
        show("error", t("booking.submitError"));
      }

    } catch (error) {
      show("error", t("booking.submitError"));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContent}>
        <LoadingOverlay visible={true} message={t("common.loading")} />
      </View>
    );
  }

  if (!centre) {
    return (
      <View style={styles.centerContent}>
        <Text>{t("booking.notFound")}</Text>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <PageHeader title={t("booking.title")} />
      <ScrollView>
        <View style={styles.centreInfo}>
          <TabBarIcon name="hospital-o" size={24} color={color.primary} />
          <View>
            <Text style={styles.centreName}>{centre.nom_centre}</Text>
            <Text style={styles.centreAddress}>{centre.adresse}</Text>
          </View>
        </View>

        <Formik
          initialValues={{ date: "", time: "" }}
          validationSchema={BookingSchema}
          onSubmit={handleBooking}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
          }) => (
            <View style={styles.form}>
              <FormField
                label={t("booking.dateLabel")}
                value={values.date}
                onChangeText={handleChange("date")}
                onBlur={handleBlur("date")}
                placeholder={t("booking.datePlaceholder")}
                error={errors.date}
                touched={touched.date}
              // In a real app, you would replace this with a proper DatePicker component
              />
              <FormField
                label={t("booking.timeLabel")}
                value={values.time}
                onChangeText={handleChange("time")}
                onBlur={handleBlur("time")}
                placeholder={t("booking.timePlaceholder")}
                error={errors.time}
                touched={touched.time}
              // In a real app, you would replace this with a proper TimePicker component
              />
              <PrimaryButton
                title={t("booking.submit")}
                onPress={() => handleSubmit()}
                loading={isSubmitting}
                style={{ marginTop: 20 }}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: color.screenBackground,
  },
  centerContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  centreInfo: {
    flexDirection: "row",
    gap: 16,
    padding: 16,
    margin: 16,
    backgroundColor: color.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: color.border,
  },
  centreName: {
    fontSize: 16,
    fontWeight: "700",
    color: color.textMain,
  },
  centreAddress: {
    fontSize: 13,
    color: color.textSecondary,
  },
  form: {
    paddingHorizontal: 16,
  },
});
