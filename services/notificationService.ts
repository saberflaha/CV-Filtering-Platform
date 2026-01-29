
import { AppSettings } from "../types";

export interface EmailPayload {
  to_email: string;
  from_name: string;
  subject: string;
  message: string;
  job_title?: string;
  candidate_name?: string;
  reply_to?: string;
  assessment_link?: string;
  interview_date?: string;
}

export const notificationService = {
  /**
   * Main dispatch method.
   * Now requires explicit settings parameter to avoid localStorage dependencies.
   */
  sendEmail: async (payload: EmailPayload, settings: AppSettings): Promise<{ success: boolean; error?: string }> => {
    if (!settings?.emailjsPublicKey || !settings?.emailjsServiceId || !settings?.emailjsTemplateId) {
      console.error('EmailJS Configuration Missing.');
      return { success: false, error: 'Configuration Missing' };
    }

    const finalPayload = {
      to_email: payload.to_email,
      candidate_email: payload.to_email,
      email: payload.to_email,
      candidate_name: payload.candidate_name || 'Candidate',
      to_name: payload.candidate_name || 'Candidate',
      user_name: payload.candidate_name || 'Candidate',
      from_name: payload.from_name || 'HR Recruitment Team',
      sender_name: payload.from_name || 'HR Recruitment Team',
      name: payload.from_name || 'HR Recruitment Team',
      title: payload.job_title || payload.subject || 'Professional Role',
      job_title: payload.job_title || payload.subject || 'Professional Role',
      subject: payload.subject,
      message: payload.message,
      content: payload.message,
      body: payload.message,
      assessment_link: payload.assessment_link || '',
      interview_date: payload.interview_date || '',
      reply_to: 'sabersabeer258@gmail.com'
    };

    if (typeof window !== 'undefined' && (window as any).emailjs) {
      try {
        const emailjs = (window as any).emailjs;
        await emailjs.send(
          settings.emailjsServiceId,
          settings.emailjsTemplateId,
          finalPayload,
          settings.emailjsPublicKey
        );
        return { success: true };
      } catch (err: any) {
        console.error('Dispatch failed:', err);
        return { success: false, error: err.text || err.message || 'Transmission Error' };
      }
    }

    return { success: false, error: 'EmailJS SDK Not Detected' };
  },

  sendApplicationConfirmation: async (app: any, jobTitle: string, settings: AppSettings) => {
    return await notificationService.sendEmail({
      to_email: app.candidateInfo.email,
      from_name: 'HR Platform Careers',
      subject: `Application Received: ${jobTitle}`,
      message: `Dear ${app.candidateInfo.fullName},\n\nThank you for applying for the ${jobTitle} position. Our AI system has successfully processed your profile. We will review your match rating and technical background shortly.\n\nBest regards,\nThe Recruitment Team`,
      candidate_name: app.candidateInfo.fullName,
      job_title: jobTitle
    }, settings);
  },

  sendInterviewInvitation: async (app: any, jobTitle: string, dateTime: string, settings: AppSettings, note?: string) => {
    return await notificationService.sendEmail({
      to_email: app.candidateInfo.email,
      from_name: 'HR Platform Talent Acquisition',
      subject: `Interview Invitation: ${jobTitle}`,
      message: `Dear ${app.candidateInfo.fullName},\n\nWe were impressed by your technical evaluation. We would like to invite you for a formal interview.\n\nScheduled Date/Time: ${dateTime}\n\n${note ? `Additional Notes: ${note}\n` : ''}\nPlease confirm your availability by replying to this email.`,
      candidate_name: app.candidateInfo.fullName,
      job_title: jobTitle,
      interview_date: dateTime
    }, settings);
  },

  sendTestInvitation: async (app: any, jobTitle: string, settings: AppSettings) => {
    const testLink = `${window.location.origin}/#/test/${app.jobId}`;
    return await notificationService.sendEmail({
      to_email: app.candidateInfo.email,
      from_name: 'HR Platform Assessment Center',
      subject: `Technical Assessment Request: ${jobTitle}`,
      message: `Hello ${app.candidateInfo.fullName},\n\nTo move forward in our process, we require a technical skills validation. Please complete the professional assessment using the link below:\n\n${testLink}\n\nNote: The test is timed. Ensure you have a stable connection.`,
      candidate_name: app.candidateInfo.fullName,
      job_title: jobTitle,
      assessment_link: testLink
    }, settings);
  },

  sendTestConfirmation: async (app: any, jobTitle: string, settings: AppSettings) => {
    return await notificationService.sendEmail({
      to_email: app.candidateInfo.email,
      from_name: 'HR Platform Recruitment',
      subject: `Assessment Completed: ${jobTitle}`,
      message: `Hello ${app.candidateInfo.fullName},\n\nThank you for completing the technical assessment for ${jobTitle}. Our hiring team has received your results and will review them shortly.`,
      candidate_name: app.candidateInfo.fullName,
      job_title: jobTitle
    }, settings);
  }
};
